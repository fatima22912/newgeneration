import { env } from "../../config/env";
import { findMockOwnerByEmail, verifyMockOwnerPassword } from "./accountService";
import { simulateDelay } from "../../mocks";
import httpClient, { setAccessToken } from "./httpClient";

function mockAuthError(message, code = "unauthorized") {
  const error = new Error(message);
  error.response = { status: 401, data: { error: { code, message } } };
  return error;
}

async function mockLogin(user) {
  const result = await simulateDelay({
    access_token: "mock-access-token",
    expires_in_minutes: 15,
    user,
  });
  setAccessToken(result.access_token);
  return result;
}

export async function ownerLogin(email, password) {
  if (env.useMocks) {
    // Un compte propriétaire n'existe en mode mock que s'il a été créé par
    // un administrateur pendant cette session (voir accountService).
    const owner = findMockOwnerByEmail(email);
    if (!owner) {
      throw mockAuthError(
        "Identifiants incorrects. Ce compte doit d'abord être créé par un administrateur.",
      );
    }
    if (!owner.is_active) {
      throw mockAuthError("Ce compte a été désactivé.");
    }
    if (!verifyMockOwnerPassword(email, password)) {
      throw mockAuthError("Identifiants incorrects.");
    }
    return mockLogin(owner);
  }
  const { data } = await httpClient.post("/auth/owner/login", { email, password });
  setAccessToken(data.access_token);
  return data;
}

export async function adminLogin(email, password) {
  if (env.useMocks) {
    // Aucune interface ne crée de compte administrateur (uniquement le
    // script d'initialisation contrôlé côté backend) : en mode mock, on se
    // contente de refléter l'email saisi, sans inventer d'identité.
    return mockLogin({
      id: 0,
      role: "admin",
      full_name: email.split("@")[0] || "Administrateur",
      email,
      phone: null,
      is_active: true,
    });
  }
  const { data } = await httpClient.post("/auth/admin/login", { email, password });
  setAccessToken(data.access_token);
  return data;
}

export async function refreshSession() {
  if (env.useMocks) return null;
  const { data } = await httpClient.post("/auth/refresh");
  setAccessToken(data.access_token);
  return data;
}

export async function logout() {
  setAccessToken(null);
  if (env.useMocks) return simulateDelay({ message: "Déconnexion réussie." });
  const { data } = await httpClient.post("/auth/logout");
  return data.data;
}

export async function changePassword(currentPassword, newPassword) {
  if (env.useMocks) return simulateDelay({ message: "Mot de passe mis à jour." });
  const { data } = await httpClient.post("/auth/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
  });
  return data.data;
}
