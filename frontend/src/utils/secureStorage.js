// Wrapper localStorage tolérant aux erreurs (mode privé, quota dépassé...).
// N'est utilisé que pour des données non sensibles (panier) : l'access token
// n'est jamais persisté ici, voir AuthContext.

export function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Stockage indisponible : on continue sans persister.
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
