import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { useToast } from "../../components/common/ToastProvider";
import { createOwner, listOwners, updateOwner } from "../../services/api/accountService";
import TextField from "../../components/common/TextField";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Loader from "../../components/common/Loader";
import styles from "./OwnerAccountForm.module.css";
import listStyles from "./OwnerAccountsList.module.css";

export default function OwnerAccountForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: ownersResponse, isLoading } = useFetch(
    () => (isEditing ? listOwners({ page_size: 100 }) : Promise.resolve(null)),
    [id],
  );

  const [form, setForm] = useState({ full_name: "", email: "", phone: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState(null);

  useEffect(() => {
    if (isEditing && ownersResponse) {
      const owner = ownersResponse.data.find((o) => o.id === Number(id));
      if (owner) {
        setForm({ full_name: owner.full_name, email: owner.email, phone: owner.phone || "" });
      }
    }
  }, [ownersResponse, isEditing, id]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditing) {
        await updateOwner(id, form);
        showToast("Compte mis à jour.", "success");
        navigate("/admin/comptes-proprietaires");
      } else {
        const response = await createOwner(form);
        setTemporaryPassword(response.temporary_password);
      }
    } catch {
      showToast("Une erreur est survenue.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  if (isEditing && isLoading) return <Loader />;

  return (
    <div>
      <h1>{isEditing ? "Modifier le compte propriétaire" : "Créer un compte propriétaire"}</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <TextField
          label="Nom complet"
          required
          value={form.full_name}
          onChange={(v) => updateField("full_name", v)}
        />
        <TextField
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(v) => updateField("email", v)}
        />
        <TextField label="Téléphone" value={form.phone} onChange={(v) => updateField("phone", v)} />

        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={() => navigate("/admin/comptes-proprietaires")}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Enregistrement..." : isEditing ? "Enregistrer" : "Créer le compte"}
          </Button>
        </div>
      </form>

      <Modal
        title="Compte créé"
        isOpen={Boolean(temporaryPassword)}
        onClose={() => navigate("/admin/comptes-proprietaires")}
      >
        <p>Mot de passe temporaire :</p>
        <p className={listStyles.passwordDisplay}>{temporaryPassword}</p>
        <p className={listStyles.warning}>
          Ce mot de passe ne sera plus jamais affiché. Transmettez-le au propriétaire par un canal
          sécurisé.
        </p>
        <Button onClick={() => navigate("/admin/comptes-proprietaires")}>Terminé</Button>
      </Modal>
    </div>
  );
}
