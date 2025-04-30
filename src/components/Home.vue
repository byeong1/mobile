<template>
  <div class="home-root">
    <div class="home-box">
      <div class="top-bar">
        <router-link to="/characters" class="nav-btn">캐릭터 목록</router-link>
        <button class="nav-btn logout-btn" @click="logout">로그아웃</button>
      </div>
      <h2 class="form-title">마비노기 숙제 체크리스트</h2>
      <div class="character-info">
        <input v-model="character.name" :readonly="!isEditing" placeholder="캐릭터명" />
        <select v-model="character.job" :disabled="!isEditing">
          <option value="">직업 선택</option>
          <option v-for="job in jobs" :key="job" :value="job">{{ job }}</option>
        </select>
        <select v-model="character.server" :disabled="!isEditing">
          <option value="">서버 선택</option>
          <option v-for="server in servers" :key="server" :value="server">{{ server }}</option>
        </select>
        <template v-if="!isEditing">
          <button class="save-btn" @click="startEdit">수정</button>
        </template>
        <template v-else>
          <button class="save-btn" @click="saveCharacter">완료</button>
          <button class="cancel-btn" @click="cancelEdit">취소</button>
        </template>
        <div v-if="error" class="error">{{ error }}</div>
      </div>
      <div class="tasks-grid">
        <div class="tasks-col">
          <div class="tasks-header">
            <span class="tasks-title">일간 숙제</span>
            <button class="all-done-btn" @click="completeAll('daily')">전체 완료</button>
            <button class="all-cancel-btn" @click="cancelAll('daily')">전체 취소</button>
          </div>
          <div v-for="task in dailyTasks" :key="task.id" class="task-row">
            <span class="task-label">{{ task.name }}</span>
            <div class="task-controls">
              <button
                class="arrow-btn"
                @click="changeCount(task, -1)"
                :disabled="task.currentCount <= 0"
              >
                ▼
              </button>
              <span class="count">{{ task.currentCount }}/{{ task.maxCount }}</span>
              <button
                class="arrow-btn"
                @click="changeCount(task, 1)"
                :disabled="task.currentCount >= task.maxCount"
              >
                ▲
              </button>
              <button
                v-if="task.currentCount < task.maxCount"
                class="done-btn"
                @click="completeTask(task)"
              >
                완료
              </button>
              <button v-else class="cancel-btn" @click="cancelTask(task)">취소</button>
            </div>
          </div>
        </div>
        <div class="tasks-col">
          <div class="tasks-header">
            <span class="tasks-title">주간 숙제</span>
            <button class="all-done-btn" @click="completeAll('weekly')">전체 완료</button>
            <button class="all-cancel-btn" @click="cancelAll('weekly')">전체 취소</button>
          </div>
          <div v-for="task in weeklyTasks" :key="task.id" class="task-row">
            <span class="task-label">{{ task.name }}</span>
            <div class="task-controls">
              <button
                class="arrow-btn"
                @click="changeCount(task, -1)"
                :disabled="task.currentCount <= 0"
              >
                ▼
              </button>
              <span class="count">{{ task.currentCount }}/{{ task.maxCount }}</span>
              <button
                class="arrow-btn"
                @click="changeCount(task, 1)"
                :disabled="task.currentCount >= task.maxCount"
              >
                ▲
              </button>
              <button
                v-if="task.currentCount < task.maxCount"
                class="done-btn"
                @click="completeTask(task)"
              >
                완료
              </button>
              <button v-else class="cancel-btn" @click="cancelTask(task)">취소</button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="tasks.length" class="all-tasks-btns">
        <button class="all-done-btn" @click="completeAll('all')">모든 숙제 전체 완료</button>
        <button class="all-cancel-btn" @click="cancelAll('all')">모든 숙제 전체 취소</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getCharacter, updateCharacter } from "../api/character";
import { getTasks, updateTask, resetTasks } from "../api/task";

const jobs = [
  "전사",
  "대검전사",
  "검술사",
  "궁수",
  "장궁병",
  "석궁사수",
  "마법사",
  "화염술사",
  "빙결술사",
  "힐러",
  "사제",
  "수도사",
  "악사",
  "댄서",
  "음유시인",
  "도적",
  "격투가",
  "듀얼블레이드",
];
const servers = ["던컨", "아이라", "데이안", "칼릭스", "라사", "메이븐", "알리사"];
const route = useRoute();
const router = useRouter();
const character = ref({ name: "", job: "", server: "" });
const originalCharacter = ref({ name: "", job: "", server: "" });
const isEditing = ref(false);
const tasks = ref([]);
const error = ref("");

const dailyTasks = ref([]);
const weeklyTasks = ref([]);

async function fetchCharacterAndTasks() {
  error.value = "";
  try {
    const res = await getCharacter(route.params.id);
    character.value = res.data;
    originalCharacter.value = { ...res.data };
    const tRes = await getTasks(route.params.id);
    tasks.value = tRes.data;
    dailyTasks.value = tasks.value.filter((t) => t.type === "daily");
    weeklyTasks.value = tasks.value.filter((t) => t.type === "weekly");
    isEditing.value = false;
  } catch (e) {
    error.value = e.response?.data?.error || "데이터 불러오기 실패";
  }
}

function startEdit() {
  isEditing.value = true;
  originalCharacter.value = { ...character.value };
}

async function saveCharacter() {
  error.value = "";
  try {
    await updateCharacter(route.params.id, character.value);
    isEditing.value = false;
    fetchCharacterAndTasks();
  } catch (e) {
    error.value = e.response?.data?.error || "캐릭터 저장 실패";
  }
}

function cancelEdit() {
  character.value = { ...originalCharacter.value };
  isEditing.value = false;
}

async function changeCount(task, delta) {
  const newCount = Math.max(0, Math.min(task.maxCount, task.currentCount + delta));
  try {
    await updateTask(task.id, { currentCount: newCount });
    fetchCharacterAndTasks();
  } catch (e) {
    error.value = e.response?.data?.error || "숙제 변경 실패";
  }
}

async function completeTask(task) {
  try {
    await updateTask(task.id, { currentCount: task.maxCount });
    fetchCharacterAndTasks();
  } catch (e) {
    error.value = e.response?.data?.error || "숙제 완료 실패";
  }
}

async function cancelTask(task) {
  try {
    await updateTask(task.id, { currentCount: 0 });
    fetchCharacterAndTasks();
  } catch (e) {
    error.value = e.response?.data?.error || "숙제 취소 실패";
  }
}

async function completeAll(type) {
  try {
    await resetTasks(route.params.id, type, "done");
    fetchCharacterAndTasks();
  } catch (e) {
    error.value = e.response?.data?.error || "전체 완료 실패";
  }
}

async function cancelAll(type) {
  try {
    await resetTasks(route.params.id, type, "cancel");
    fetchCharacterAndTasks();
  } catch (e) {
    error.value = e.response?.data?.error || "전체 취소 실패";
  }
}

function logout() {
  localStorage.removeItem("token");
  router.push("/login");
}

onMounted(() => {
  if (!localStorage.getItem("token")) {
    alert("로그인이 필요합니다.");
    router.push("/login");
    return;
  }
  fetchCharacterAndTasks();
});
watch(() => route.params.id, fetchCharacterAndTasks);
</script>

<style scoped>
.home-root {
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #181818;
  overflow-x: hidden;
}
.home-box {
  max-width: 900px;
  min-width: 340px;
  margin: 40px auto;
  padding: 32px 32px 24px 32px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}
.top-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 4px;
}
.nav-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 7px 18px;
  font-size: 1em;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.15s, color 0.15s, transform 0.1s;
  margin-left: 8px;
  cursor: pointer;
}
.nav-btn:hover {
  background: #1256a6;
}
.nav-btn:active {
  background: #0d3c73;
  transform: scale(0.97);
}
.logout-btn {
  background: #f44336;
  color: #fff;
  margin-left: 8px;
}
.logout-btn:hover {
  background: #d32f2f;
}
.logout-btn:active {
  background: #b71c1c;
  transform: scale(0.97);
}
.form-title {
  color: #222;
  margin-bottom: 24px;
  font-size: 2rem;
  font-weight: 700;
  white-space: nowrap;
}
.character-info {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.character-info input,
.character-info select {
  margin: 0;
  display: block;
  width: 180px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 1em;
  white-space: nowrap;
}
.save-btn,
.cancel-btn {
  white-space: nowrap;
}
.save-btn:hover,
.all-done-btn:hover,
.done-btn:hover {
  background: #222;
  color: #fff;
  border-color: #222;
}
.save-btn:active,
.all-done-btn:active,
.done-btn:active {
  background: #111;
  color: #fff;
  border-color: #111;
  transform: scale(0.97);
}
.cancel-btn:hover,
.all-cancel-btn:hover {
  background: #d32f2f;
}
.cancel-btn:active,
.all-cancel-btn:active {
  background: #b71c1c;
  transform: scale(0.97);
}
.tasks-grid {
  display: flex;
  gap: 40px;
  justify-content: space-between;
  margin-bottom: 24px;
}
.tasks-col {
  flex: 1;
  min-width: 260px;
}
.tasks-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.tasks-title {
  font-size: 1.1em;
  font-weight: 600;
  color: #444;
  margin-right: 8px;
  white-space: nowrap;
}
.task-row {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  padding: 10px 0 10px 0;
  border-bottom: 1px solid #eee;
}
.task-label {
  flex: 0 0 90px;
  color: #222;
  font-size: 1em;
  font-weight: 500;
  white-space: nowrap;
}
.task-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 12px;
}
.arrow-btn {
  background: #eee;
  border: none;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  font-size: 1.2em;
  color: #222;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}
.arrow-btn:disabled {
  background: #f5f5f5;
  color: #aaa;
  cursor: not-allowed;
}
.arrow-btn:hover:not(:disabled) {
  background: #ddd;
}
.arrow-btn:active:not(:disabled) {
  background: #bbb;
  transform: scale(0.95);
}
.count {
  display: inline-block;
  width: 48px;
  text-align: center;
  font-size: 1.1em;
  font-weight: 600;
  color: #111;
  background: none;
  white-space: nowrap;
}
.done-btn {
  background: #222;
  border: none;
  color: #fff;
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, transform 0.1s;
  white-space: nowrap;
}
.done-btn:hover {
  background: #444;
  color: #fff;
}
.done-btn:active {
  background: #111;
  color: #fff;
  transform: scale(0.97);
}
.cancel-btn {
  background: #f44336;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 1em;
  font-weight: 500;
  cursor: pointer;
  margin-left: 4px;
  white-space: nowrap;
}
.all-done-btn {
  background: #fff;
  border: 1.5px solid #222;
  color: #222;
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 1em;
  font-weight: 500;
  margin-left: 8px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.all-cancel-btn {
  background: #f44336;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 1em;
  font-weight: 500;
  margin-left: 4px;
  cursor: pointer;
  white-space: nowrap;
}
.all-tasks-btns {
  margin-top: 24px;
  text-align: center;
}
.error {
  color: #f44336;
  margin-top: 10px;
  text-align: center;
}
@media (max-width: 900px) {
  .home-root {
    align-items: flex-start;
    padding-top: 24px;
    min-height: 100vh;
  }
  .home-box {
    max-width: 98vw;
    padding: 16px 4vw 16px 4vw;
  }
  .tasks-grid {
    flex-direction: column;
    gap: 24px;
  }
  .tasks-col {
    min-width: 0;
  }
}
.save-btn {
  background: #222;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 1em;
  font-weight: 500;
  transition: background 0.15s, color 0.15s, transform 0.1s;
}
.save-btn:hover {
  background: #444;
  color: #fff;
}
.save-btn:active {
  background: #111;
  color: #fff;
  transform: scale(0.97);
}
.save-btn:hover,
.cancel-btn:hover,
.all-done-btn:hover,
.all-cancel-btn:hover,
.done-btn:hover,
.arrow-btn:hover:not(:disabled) {
  cursor: pointer;
}
</style>
