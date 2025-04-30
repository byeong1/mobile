import api from "./axios";

export async function getCharacters() {
  return api.get("/characters");
}

export async function addCharacter({ name, job, server }) {
  return api.post("/characters", { name, job, server });
}

export async function getCharacter(id) {
  return api.get(`/characters/${id}`);
}

export async function updateCharacter(id, { name, job, server }) {
  return api.put(`/characters/${id}`, { name, job, server });
}

export async function deleteCharacter(id) {
  return api.delete(`/characters/${id}`);
}
