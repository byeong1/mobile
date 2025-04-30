import api from "./axios";

export async function register(accountId, password) {
  return api.post("/register", { accountId, password });
}

export async function login(accountId, password) {
  return api.post("/login", { accountId, password });
}

export async function getMe() {
  return api.get("/me");
}
