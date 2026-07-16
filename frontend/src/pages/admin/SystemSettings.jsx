import { useState } from "react";
import { useToast } from "../../components/common/ToastProvider";
import Button from "../../components/common/Button";
import styles from "./SystemSettings.module.css";

// Page d'extension pour les réglages système (mode maintenance, réglages
// globaux). Aucune route backend dédiée n'existe encore dans le contrat API
// (section 8) : cet écran sert de point d'extension prêt à être branché sur
// un futur GET/PUT /api/v1/settings, sans persistance serveur pour l'instant.
export default function SystemSettings() {
  const { showToast } = useToast();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  function handleSave(e) {
    e.preventDefault();
    showToast("Réglages enregistrés localement (non persistés côté serveur pour l'instant).", "success");
  }

  return (
    <div>
      <h1>Paramètres système</h1>
      <p className={styles.note}>
        Ces réglages ne sont pas encore reliés à une route backend dédiée — ils constituent un
        point d'extension prévu par le cahier des charges, à finaliser lors d'une prochaine
        itération.
      </p>

      <form className={styles.form} onSubmit={handleSave}>
        <label className={styles.toggleRow}>
          <input
            type="checkbox"
            checked={maintenanceMode}
            onChange={(e) => setMaintenanceMode(e.target.checked)}
          />
          Activer le mode maintenance (site en lecture seule pour les visiteurs)
        </label>

        <div className={styles.field}>
          <label htmlFor="announcement" className={styles.label}>
            Message d'information (bandeau site)
          </label>
          <textarea
            id="announcement"
            rows={3}
            className={styles.textarea}
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
          />
        </div>

        <Button type="submit">Enregistrer</Button>
      </form>
    </div>
  );
}
