import { formatDateTime } from "../../utils/formatters";

const ACTION_LABELS = {
  "auth.login_success": "Connexion réussie",
  "auth.login_failed": "Tentative de connexion échouée",
  "auth.password_changed": "Mot de passe modifié",
  "account.created": "Compte propriétaire créé",
  "account.updated": "Compte propriétaire modifié",
  "account.disabled": "Compte propriétaire désactivé",
  "account.enabled": "Compte propriétaire réactivé",
  "account.password_reset": "Mot de passe réinitialisé",
  "product.created": "Produit créé",
  "product.updated": "Produit modifié",
  "product.deleted": "Produit supprimé",
  "product.duplicated": "Produit dupliqué",
  "product.image_added": "Image produit ajoutée",
  "category.created": "Catégorie créée",
  "category.updated": "Catégorie modifiée",
  "category.deleted": "Catégorie supprimée",
  "order.status_updated": "Statut de commande modifié",
};

export default function ActivityLogRow({ entry }) {
  return (
    <tr>
      <td data-label="Date">{formatDateTime(entry.created_at)}</td>
      <td data-label="Action">{ACTION_LABELS[entry.action] || entry.action}</td>
      <td data-label="Élément">
        {entry.entity_type}
        {entry.entity_id ? ` #${entry.entity_id}` : ""}
      </td>
      <td data-label="Auteur">{entry.user_id ? `Utilisateur #${entry.user_id}` : "Système"}</td>
      <td data-label="Adresse IP">{entry.ip_address || "—"}</td>
    </tr>
  );
}
