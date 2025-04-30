<template>
  <div class="auth-root">
    <div class="auth-container">
      <h2 class="form-title">로그인</h2>
      <input v-model="accountId" placeholder="아이디" type="text" />
      <input v-model="password" placeholder="비밀번호" type="password" />
      <button @click="loginHandler">로그인</button>
      <div class="link">
        <router-link to="/register">회원가입</router-link>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { login } from "../api/auth";

const accountId = ref("");
const password = ref("");
const error = ref("");
const router = useRouter();

async function loginHandler() {
  error.value = "";
  if (!accountId.value || !password.value) {
    error.value = "아이디와 비밀번호를 입력하세요.";
    return;
  }
  try {
    const res = await login(accountId.value, password.value);
    localStorage.setItem("token", res.data.token);
    router.push("/characters");
  } catch (e) {
    error.value = e.response?.data?.error || "로그인 실패";
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
  background: #4caf50;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1em;
}
button:hover {
  background: #388e3c;
  cursor: pointer;
}
button:active {
  background: #256029;
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
