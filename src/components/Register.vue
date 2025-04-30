<template>
  <div class="auth-root">
    <div class="auth-container">
      <h2 class="form-title">회원가입</h2>
      <input v-model="accountId" placeholder="이메일" type="accountId" />
      <input v-model="password" placeholder="비밀번호" type="password" />
      <input v-model="password2" placeholder="비밀번호 확인" type="password" />
      <button @click="registerHandler">회원가입</button>
      <div class="link">
        <router-link to="/login">로그인</router-link>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { register } from "../api/auth";

const accountId = ref("");
const password = ref("");
const password2 = ref("");
const error = ref("");
const router = useRouter();

async function registerHandler() {
  error.value = "";
  if (!accountId.value || !password.value || !password2.value) {
    error.value = "모든 항목을 입력하세요.";
    return;
  }
  if (password.value !== password2.value) {
    error.value = "비밀번호가 일치하지 않습니다.";
    return;
  }
  try {
    await register(accountId.value, password.value);
    router.push("/login");
  } catch (e) {
    error.value = e.response?.data?.error || "회원가입 실패";
  }
}
</script>

<style scoped>
.auth-root {
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #181818;
  overflow-x: hidden;
}
.auth-container {
  max-width: 900px;
  min-width: 340px;
  margin: 40px auto;
  padding: 32px 32px 24px 32px;
  border: none;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}
.form-title {
  color: #222;
  margin-bottom: 24px;
}
input {
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
button:hover {
  background: #1565c0;
  cursor: pointer;
}
button:active {
  background: #0d3c73;
  transform: scale(0.97);
}
.link {
  margin-top: 12px;
  text-align: right;
}
.error {
  color: #f44336;
  margin-top: 10px;
  text-align: center;
}
@media (max-width: 900px) {
  .auth-root {
    align-items: flex-start;
    padding-top: 24px;
    min-height: 100vh;
  }
  .auth-container {
    max-width: 98vw;
    padding: 16px 4vw 16px 4vw;
  }
}
</style>
