import { Link } from "react-router-dom";
import { formatDate } from "../../utils/formatters";
import styles from "./OwnerAccountRow.module.css";

export default function OwnerAccountRow({ owner, onDisable, onEnable, onResetPassword }) {
  return (
    <tr>
      <td data-label="Nom">{owner.full_name}</td>
      <td data-label="Email">{owner.email}</td>
      <td data-label="Téléphone">{owner.phone || "—"}</td>
      <td data-label="Créé le">{formatDate(owner.created_at)}</td>
      <td data-label="Statut">
        <span className={owner.is_active ? styles.statusActive : styles.statusInactive}>
          {owner.is_active ? "Actif" : "Désactivé"}
        </span>
      </td>
      <td data-label="Actions">
        <div className={styles.actions}>
          <Link to={`/admin/comptes-proprietaires/${owner.id}`}>Modifier</Link>
          {owner.is_active ? (
            <button type="button" className={styles.danger} onClick={() => onDisable(owner)}>
              Désactiver
            </button>
          ) : (
            <button type="button" onClick={() => onEnable(owner)}>
              Réactiver
            </button>
          )}
          <button type="button" onClick={() => onResetPassword(owner)}>
            Réinitialiser le mot de passe
          </button>
        </div>
      </td>
    </tr>
  );
}
