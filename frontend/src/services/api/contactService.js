import { env } from "../../config/env";
import { simulateDelay } from "../../mocks";
import httpClient from "./httpClient";

export async function sendContactMessage(payload) {
  if (env.useMocks) {
    return simulateDelay({ data: { id: Date.now(), is_read: false, created_at: new Date().toISOString(), ...payload } });
  }
  const { data } = await httpClient.post("/contact", payload);
  return data;
}
