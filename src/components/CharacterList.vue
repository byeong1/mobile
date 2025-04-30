<template>
  <div class="list-root">
    <div class="character-list-container">
      <div class="top-bar">
        <button class="nav-btn logout-btn" @click="logout">로그아웃</button>
      </div>
      <h2 class="form-title">내 캐릭터 목록</h2>
      <ul>
        <li v-for="character in characters" :key="character.id" class="character-card">
          <div class="character-info-block">
            <div class="character-nickname">닉네임 : {{ character.name }}</div>
            <div class="character-meta">{{ character.job }} / {{ character.server }}</div>
          </div>
          <div class="card-btns">
            <button class="task-btn" @click="goToCharacter(character.id)">숙제 확인</button>
            <button class="delete-btn" @click.stop="deleteChar(character.id)">삭제</button>
          </div>
        </li>
      </ul>
      <button @click="goToAdd" class="add-btn">캐릭터 추가</button>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getCharacters, deleteCharacter } from "../api/character";

const router = useRouter();
const characters = ref([]);
const error = ref("");

async function fetchCharacters() {
  try {
    const res = await getCharacters();
    characters.value = res.data;
  } catch (e) {
    error.value = e.response?.data?.error || "캐릭터 목록 불러오기 실패";
  }
}

async function deleteChar(id) {
  if (!confirm("정말 삭제하시겠습니까?")) return;
  try {
    await deleteCharacter(id);
    fetchCharacters();
  } catch (e) {
    error.value = e.response?.data?.error || "삭제 실패";
  }
}

function goToCharacter(id) {
  router.push(`/characters/${id}`);
}

function goToAdd() {
  router.push("/characters/add");
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
  fetchCharacters();
});
</script>

<style scoped>
.list-root {
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #181818;
  overflow-x: hidden;
}
.character-list-container {
  max-width: 900px;
  min-width: 340px;
  margin: 40px auto;
  padding: 32px 32px 24px 32px;
  border: none;
  border-radius: 16px;
  background: #fff;
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
}
.character-info-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  min-width: 0;
}
.character-nickname {
  color: #222;
  font-weight: bold;
  font-size: 1.1em;
  margin-bottom: 2px;
  word-break: break-all;
  margin-right: 50px;
}
.character-meta {
  color: #666;
  font-size: 0.98em;
  word-break: break-all;
}
ul {
  list-style: none;
  padding: 0;
}
.character-card {
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 18px 16px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s;
}
.character-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}
.card-btns {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
li:last-child {
  border-bottom: none;
}
.add-btn {
  margin-top: 8px;
  width: 100%;
  padding: 16px;
  background: #6ab96a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.2em;
}
.add-btn:hover {
  background: #519e51;
}
.add-btn:active {
  background: #357a35;
  transform: scale(0.97);
}
.add-btn:hover,
.task-btn:hover,
.delete-btn:hover {
  cursor: pointer;
}
button {
  font-size: 1em;
}
.task-btn {
  background: #1976d2;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 18px;
  font-size: 1em;
}
.task-btn:hover {
  background: #1256a6;
}
.task-btn:active {
  background: #0d3c73;
  transform: scale(0.97);
}
.delete-btn {
  width: auto;
  margin-top: 0;
  background: #f44336;
  color: #fff;
  padding: 8px 18px;
  font-size: 1em;
  border-radius: 6px;
}
.delete-btn:hover {
  background: #d32f2f;
}
.delete-btn:active {
  background: #b71c1c;
  transform: scale(0.97);
}
.error {
  color: #f44336;
  margin-top: 10px;
  text-align: center;
}
@media (max-width: 900px) {
  .list-root {
    align-items: flex-start;
    padding-top: 24px;
    min-height: 100vh;
  }
  .character-list-container {
    max-width: 98vw;
    padding: 16px 4vw 16px 4vw;
  }
}
</style>
