import { env } from "../../config/env";
import { mockCategories } from "../../mocks/categories";
import { simulateDelay } from "../../mocks";
import { loadMockState, saveMockState } from "../../mocks/persistence";
import httpClient from "./httpClient";

let mockStore = loadMockState("categories", mockCategories);

function persist() {
  saveMockState("categories", mockStore);
}

export function findMockCategoryById(id) {
  return mockStore.find((c) => c.id === Number(id));
}

export async function listCategories() {
  if (env.useMocks) return simulateDelay({ data: mockStore });
  const { data } = await httpClient.get("/categories");
  return data;
}

export async function createCategory(payload) {
  if (env.useMocks) {
    const category = {
      id: Math.max(0, ...mockStore.map((c) => c.id)) + 1,
      slug: payload.name.toLowerCase().replace(/\s+/g, "-"),
      ...payload,
    };
    mockStore = [...mockStore, category];
    persist();
    return simulateDelay({ data: category });
  }
  const { data } = await httpClient.post("/categories", payload);
  return data;
}

export async function updateCategory(id, payload) {
  if (env.useMocks) {
    mockStore = mockStore.map((c) => (c.id === id ? { ...c, ...payload } : c));
    persist();
    return simulateDelay({ data: mockStore.find((c) => c.id === id) });
  }
  const { data } = await httpClient.put(`/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id) {
  if (env.useMocks) {
    mockStore = mockStore.filter((c) => c.id !== id);
    persist();
    return simulateDelay(null);
  }
  await httpClient.delete(`/categories/${id}`);
}
