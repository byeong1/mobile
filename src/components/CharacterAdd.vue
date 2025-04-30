<template>
  <div class="character-add-container">
    <h2 class="form-title">캐릭터 추가</h2>
    <input v-model="name" placeholder="캐릭터명" />
    <select v-model="job">
      <option value="">직업 선택</option>
      <option v-for="j in jobs" :key="j" :value="j">{{ j }}</option>
    </select>
    <select v-model="server">
      <option value="">서버 선택</option>
      <option v-for="s in servers" :key="s" :value="s">{{ s }}</option>
    </select>
    <button @click="saveHandler">저장</button>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { addCharacter } from "../api/character";

const router = useRouter();
const name = ref("");
const job = ref("");
const server = ref("");
const error = ref("");
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

async function saveHandler() {
  error.value = "";
  if (!name.value || !job.value || !server.value) {
    error.value = "모든 항목을 입력하세요.";
    return;
  }
  try {
    await addCharacter({ name: name.value, job: job.value, server: server.value });
    router.push("/characters");
  } catch (e) {
    error.value = e.response?.data?.error || "캐릭터 추가 실패";
  }
}
</script>

<style scoped>
.character-add-container {
  max-width: 320px;
  margin: 40px auto;
  padding: 24px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}
.form-title {
  color: #222;
  margin-bottom: 24px;
}
input,
select {
  display: block;
  width: 100%;
  margin-bottom: 12px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
button {
  width: 100%;
  padding: 8px;
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1em;
}
.error {
  color: #f44336;
  margin-top: 10px;
  text-align: center;
}
</style>
