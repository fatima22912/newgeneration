import { readJSON, writeJSON } from "../utils/secureStorage";

// Persiste les données créées en mode mock (localStorage) pour qu'elles
// survivent à un rechargement de page pendant une session de test — sans
// backend, la mémoire JS seule serait perdue à chaque navigation complète.
// Ce n'est qu'une commodité de démonstration locale, jamais une vraie base
// de données partagée entre plusieurs personnes/appareils.

export function loadMockState(key, fallback) {
  return readJSON(`ng_mock_${key}`, fallback);
}

export function saveMockState(key, value) {
  writeJSON(`ng_mock_${key}`, value);
}
