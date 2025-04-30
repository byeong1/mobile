const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

app.use(cors());
app.use(express.json());

// 회원가입
app.post("/api/register", async (req, res) => {
  const { accountId, password } = req.body;
  if (!accountId || !password) return res.status(400).json({ error: "필수값 누락" });
  const exists = await prisma.user.findUnique({ where: { accountId } });
  if (exists) return res.status(409).json({ error: "이미 존재하는 계정" });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { accountId, password: hash } });
  res.json({ id: user.id, accountId: user.accountId });
});

// 로그인
app.post("/api/login", async (req, res) => {
  const { accountId, password } = req.body;
  const user = await prisma.user.findUnique({ where: { accountId } });
  if (!user) return res.status(401).json({ error: "계정 또는 비밀번호 오류" });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "계정 또는 비밀번호 오류" });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

// 인증 미들웨어
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "인증 필요" });
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "토큰 오류" });
  }
}

// 내 정보
app.get("/api/me", auth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) return res.status(404).json({ error: "사용자 없음" });
  res.json({ id: user.id, accountId: user.accountId });
});

// 내 캐릭터 목록
app.get("/api/characters", auth, async (req, res) => {
  const characters = await prisma.character.findMany({
    where: { userId: req.user.userId, deletedAt: null },
    orderBy: { createdAt: "asc" },
  });
  res.json(characters);
});

// 캐릭터 추가
app.post("/api/characters", auth, async (req, res) => {
  const { name, job, server } = req.body;
  if (!name || !job || !server) return res.status(400).json({ error: "필수값 누락" });
  const character = await prisma.character.create({
    data: {
      name,
      job,
      server,
      userId: req.user.userId,
    },
  });
  // 캐릭터 생성 시 기본 숙제(Task) 세트도 자동 생성
  const dailyTasks = [
    { name: "검은 구멍", maxCount: 3 },
    { name: "결계", maxCount: 4 },
    { name: "요일 던전", maxCount: 1 },
  ];

  const weeklyTasks = [
    { name: "어비스", maxCount: 3 },
    { name: "필드 보스", maxCount: 3 },
    { name: "레이드", maxCount: 1 },
  ];

  const now = new Date();

  await prisma.task.createMany({
    data: [
      ...dailyTasks.map((t) => ({
        ...t,
        type: "daily",
        characterId: character.id,
        lastReset: now,
      })),
      ...weeklyTasks.map((t) => ({
        ...t,
        type: "weekly",
        characterId: character.id,
        lastReset: now,
      })),
    ],
  });
  res.json(character);
});

// 캐릭터 상세
app.get("/api/characters/:id", auth, async (req, res) => {
  const character = await prisma.character.findFirst({
    where: { id: Number(req.params.id), userId: req.user.userId, deletedAt: null },
  });
  if (!character) return res.status(404).json({ error: "캐릭터 없음" });
  res.json(character);
});

// 캐릭터 수정
app.put("/api/characters/:id", auth, async (req, res) => {
  const { name, job, server } = req.body;
  const character = await prisma.character.update({
    where: { id: Number(req.params.id) },
    data: { name, job, server, updatedAt: new Date() },
  });
  res.json(character);
});

// 캐릭터 삭제 (soft delete)
app.delete("/api/characters/:id", auth, async (req, res) => {
  await prisma.character.update({
    where: { id: Number(req.params.id) },
    data: { deletedAt: new Date() },
  });
  res.json({ ok: true });
});

// 캐릭터별 숙제 전체 조회
app.get("/api/characters/:id/tasks", auth, async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { characterId: Number(req.params.id), deletedAt: null },
    orderBy: { id: "asc" },
  });
  res.json(tasks);
});

// 숙제 진행도/완료/취소 등 변경
app.put("/api/tasks/:taskId", auth, async (req, res) => {
  const { currentCount, lastReset } = req.body;
  const task = await prisma.task.update({
    where: { id: Number(req.params.taskId) },
    data: {
      currentCount,
      lastReset: lastReset ? new Date(lastReset) : undefined,
      updatedAt: new Date(),
    },
  });
  res.json(task);
});

// 숙제 일괄 초기화 (일간/주간/전체)
app.post("/api/characters/:id/tasks/reset", auth, async (req, res) => {
  // type: 'daily', 'weekly', 'all', action: 'done'|'cancel'
  const { type, action } = req.body;
  const where = { characterId: Number(req.params.id), deletedAt: null };
  if (type === "daily" || type === "weekly") where.type = type;

  if (action === "done") {
    // 전체 완료: currentCount를 maxCount로
    const tasks = await prisma.task.findMany({ where });
    await Promise.all(
      tasks.map((task) =>
        prisma.task.update({
          where: { id: task.id },
          data: { currentCount: task.maxCount, lastReset: new Date(), updatedAt: new Date() },
        })
      )
    );
  } else {
    // 전체 취소: currentCount를 0으로
    await prisma.task.updateMany({
      where,
      data: { currentCount: 0, lastReset: new Date(), updatedAt: new Date() },
    });
  }
  res.json({ ok: true });
});

app.listen(3333, () => {
  console.log("API 서버 실행중: http://localhost:3333");
});
