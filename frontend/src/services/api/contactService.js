import { env } from "../../config/env";
import { paginate, simulateDelay } from "../../mocks";
import { loadMockState, saveMockState } from "../../mocks/persistence";
import httpClient from "./httpClient";

let mockStore = loadMockState("contact_messages", []);

function persist() {
  saveMockState("contact_messages", mockStore);
}

export async function sendContactMessage(payload) {
  if (env.useMocks) {
    const message = { id: Date.now(), is_read: false, created_at: new Date().toISOString(), ...payload };
    mockStore = [message, ...mockStore];
    persist();
    return simulateDelay({ data: message });
  }
  const { data } = await httpClient.post("/contact", payload);
  return data;
}

export async function listContactMessages(params = {}) {
  if (env.useMocks) {
    const sorted = [...mockStore].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return simulateDelay(paginate(sorted, params.page || 1, params.page_size || 20));
  }
  const { data } = await httpClient.get("/contact", { params });
  return data;
}

export async function getContactMessage(id) {
  if (env.useMocks) {
    return simulateDelay({ data: mockStore.find((m) => m.id === Number(id)) });
  }
  const { data } = await httpClient.get(`/contact/${id}`);
  return data;
}

export async function markContactMessageRead(id) {
  if (env.useMocks) {
    const numericId = Number(id);
    mockStore = mockStore.map((m) => (m.id === numericId ? { ...m, is_read: true } : m));
    persist();
    return simulateDelay({ data: mockStore.find((m) => m.id === numericId) });
  }
  const { data } = await httpClient.patch(`/contact/${id}/read`);
  return data;
}
