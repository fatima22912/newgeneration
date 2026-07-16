import { env } from "../../config/env";
import { mockActivityLog } from "../../mocks/activityLog";
import { mockOwners } from "../../mocks/accounts";
import { paginate, simulateDelay } from "../../mocks";
import { loadMockState, saveMockState } from "../../mocks/persistence";
import httpClient from "./httpClient";

let mockStore = loadMockState("owners", mockOwners);
// Mots de passe temporaires émis en mode mock, pour que la connexion
// propriétaire (authService) n'accepte que des comptes réellement créés par
// un administrateur pendant la session — comme dans le vrai backend.
const mockCredentials = new Map(Object.entries(loadMockState("owner_credentials", {})));

function persist() {
  saveMockState("owners", mockStore);
  saveMockState("owner_credentials", Object.fromEntries(mockCredentials));
}

export function findMockOwnerByEmail(email) {
  return mockStore.find((o) => o.email.toLowerCase() === email.toLowerCase());
}

export function verifyMockOwnerPassword(email, password) {
  return mockCredentials.get(email.toLowerCase()) === password;
}

export function getMockOwnersCount() {
  return mockStore.length;
}

export async function listOwners(params = {}) {
  if (env.useMocks) {
    return simulateDelay(paginate(mockStore, params.page || 1, params.page_size || 20));
  }
  const { data } = await httpClient.get("/accounts/owners", { params });
  return data;
}

export async function createOwner(payload) {
  if (env.useMocks) {
    const owner = {
      id: Math.max(0, ...mockStore.map((o) => o.id)) + 1,
      role: "owner",
      is_active: true,
      failed_login_attempts: 0,
      locked_until: null,
      created_at: new Date().toISOString(),
      ...payload,
    };
    mockStore = [owner, ...mockStore];
    const temporary_password = "TempPass" + Math.floor(Math.random() * 10000);
    mockCredentials.set(owner.email.toLowerCase(), temporary_password);
    persist();
    return simulateDelay({ owner, temporary_password });
  }
  const { data } = await httpClient.post("/accounts/owners", payload);
  return data;
}

export async function updateOwner(id, payload) {
  if (env.useMocks) {
    const numericId = Number(id);
    mockStore = mockStore.map((o) => (o.id === numericId ? { ...o, ...payload } : o));
    persist();
    return simulateDelay({ data: mockStore.find((o) => o.id === numericId) });
  }
  const { data } = await httpClient.put(`/accounts/owners/${id}`, payload);
  return data;
}

export async function disableOwner(id) {
  if (env.useMocks) {
    const numericId = Number(id);
    mockStore = mockStore.map((o) => (o.id === numericId ? { ...o, is_active: false } : o));
    persist();
    return simulateDelay({ data: mockStore.find((o) => o.id === numericId) });
  }
  const { data } = await httpClient.patch(`/accounts/owners/${id}/disable`);
  return data;
}

export async function enableOwner(id) {
  if (env.useMocks) {
    const numericId = Number(id);
    mockStore = mockStore.map((o) => (o.id === numericId ? { ...o, is_active: true } : o));
    persist();
    return simulateDelay({ data: mockStore.find((o) => o.id === numericId) });
  }
  const { data } = await httpClient.patch(`/accounts/owners/${id}/enable`);
  return data;
}

export async function resetOwnerPassword(id) {
  if (env.useMocks) {
    const owner = mockStore.find((o) => o.id === Number(id));
    const temporary_password = "ResetPass" + Math.floor(Math.random() * 10000);
    if (owner) {
      mockCredentials.set(owner.email.toLowerCase(), temporary_password);
      persist();
    }
    return simulateDelay({ owner, temporary_password });
  }
  const { data } = await httpClient.patch(`/accounts/owners/${id}/reset-password`);
  return data;
}

export async function listActivityLog(params = {}) {
  if (env.useMocks) {
    return simulateDelay(paginate(mockActivityLog, params.page || 1, params.page_size || 20));
  }
  const { data } = await httpClient.get("/activity-log", { params });
  return data;
}
