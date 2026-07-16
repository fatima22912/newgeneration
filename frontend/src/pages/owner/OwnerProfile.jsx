import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/common/ToastProvider";
import { changePassword } from "../../services/api/authService";
import TextField from "../../components/common/TextField";
import Button from "../../components/common/Button";
import styles from "./OwnerProfile.module.css";

export default function OwnerProfile() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      showToast("Mot de passe mis à jour.", "success");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      showToast("Impossible de changer le mot de passe. Vérifiez le mot de passe actuel.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h1>Mon profil</h1>

      <section className={styles.card}>
        <h2>Informations</h2>
        <p>{user?.full_name}</p>
        <p>{user?.email}</p>
        <p>{user?.phone || "Aucun téléphone renseigné"}</p>
      </section>

      <section className={styles.card}>
        <h2>Changer de mot de passe</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <TextField
            label="Mot de passe actuel"
            type="password"
            required
            value={currentPassword}
            onChange={setCurrentPassword}
          />
          <TextField
            label="Nouveau mot de passe"
            type="password"
            required
            minLength={12}
            value={newPassword}
            onChange={setNewPassword}
            hint="12 caractères minimum."
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Mise à jour..." : "Mettre à jour"}
          </Button>
        </form>
      </section>
    </div>
  );
}
