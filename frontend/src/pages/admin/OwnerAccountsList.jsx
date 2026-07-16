import { useState } from "react";
import { Link } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { usePagination } from "../../hooks/usePagination";
import { useToast } from "../../components/common/ToastProvider";
import {
  listOwners,
  disableOwner,
  enableOwner,
  resetOwnerPassword,
} from "../../services/api/accountService";
import OwnerAccountRow from "../../components/admin/OwnerAccountRow";
import Pagination from "../../components/common/Pagination";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Modal from "../../components/common/Modal";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import styles from "./OwnerAccountsList.module.css";

export default function OwnerAccountsList() {
  const { page, goToPage } = usePagination();
  const { data: response, isLoading, refetch } = useFetch(
    () => listOwners({ page, page_size: 20 }),
    [page],
  );
  const { showToast } = useToast();

  const [ownerToDisable, setOwnerToDisable] = useState(null);
  const [temporaryPassword, setTemporaryPassword] = useState(null);

  async function handleDisable() {
    await disableOwner(ownerToDisable.id);
    showToast("Compte désactivé.", "success");
    setOwnerToDisable(null);
    refetch();
  }

  async function handleEnable(owner) {
    await enableOwner(owner.id);
    showToast("Compte réactivé.", "success");
    refetch();
  }

  async function handleResetPassword(owner) {
    const response = await resetOwnerPassword(owner.id);
    setTemporaryPassword({ owner, password: response.temporary_password });
  }

  const owners = response?.data || [];

  return (
    <div>
      <div className={styles.header}>
        <h1>Comptes propriétaires</h1>
        <Link to="/admin/comptes-proprietaires/nouveau">
          <Button>Créer un compte</Button>
        </Link>
      </div>

      {isLoading ? (
        <Loader />
      ) : owners.length === 0 ? (
        <EmptyState message="Aucun compte propriétaire pour l'instant." />
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Nom</th>
                  <th scope="col">Email</th>
                  <th scope="col">Téléphone</th>
                  <th scope="col">Créé le</th>
                  <th scope="col">Statut</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {owners.map((owner) => (
                  <OwnerAccountRow
                    key={owner.id}
                    owner={owner}
                    onDisable={setOwnerToDisable}
                    onEnable={handleEnable}
                    onResetPassword={handleResetPassword}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={response.meta.page}
            totalPages={response.meta.total_pages}
            onPageChange={(p) => goToPage(p, response.meta.total_pages)}
          />
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(ownerToDisable)}
        title="Désactiver ce compte ?"
        message={`« ${ownerToDisable?.full_name} » ne pourra plus se connecter tant que le compte n'est pas réactivé.`}
        onConfirm={handleDisable}
        onCancel={() => setOwnerToDisable(null)}
      />

      <Modal
        title="Mot de passe temporaire"
        isOpen={Boolean(temporaryPassword)}
        onClose={() => setTemporaryPassword(null)}
      >
        <p>
          Nouveau mot de passe pour <strong>{temporaryPassword?.owner.full_name}</strong> :
        </p>
        <p className={styles.passwordDisplay}>{temporaryPassword?.password}</p>
        <p className={styles.warning}>
          Ce mot de passe ne sera plus jamais affiché. Transmettez-le au propriétaire par un
          canal sécurisé (en personne, par téléphone).
        </p>
      </Modal>
    </div>
  );
}
