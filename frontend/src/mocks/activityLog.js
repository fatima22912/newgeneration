// Aucune entrée pré-créée : le vrai backend journalise chaque action
// sensible au fil de l'eau (voir activity_log_service côté backend). En
// mode mock (sans backend), le journal reste vide plutôt que d'inventer un
// historique.
export const mockActivityLog = [];
