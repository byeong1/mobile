import api from "./axios";

export async function getTasks(characterId) {
  return api.get(`/characters/${characterId}/tasks`);
}

export async function updateTask(taskId, { currentCount, lastReset }) {
  return api.put(`/tasks/${taskId}`, { currentCount, lastReset });
}

export async function resetTasks(characterId, type, action = "cancel") {
  return api.post(`/characters/${characterId}/tasks/reset`, { type, action });
}
