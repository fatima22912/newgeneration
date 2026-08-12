import { env } from "../config/env";

const backendOrigin = new URL(env.apiBaseUrl).origin;

export function resolveImageUrl(path) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  return `${backendOrigin}${path}`;
}
