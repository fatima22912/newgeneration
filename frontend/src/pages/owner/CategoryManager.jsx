import { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import { useToast } from "../../components/common/ToastProvider";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/api/categoryService";
import TextField from "../../components/common/TextField";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import DataTable from "../../components/common/DataTable";
import Loader from "../../components/common/Loader";
import styles from "./CategoryManager.module.css";

export default function CategoryManager() {
  const { data: response, isLoading, refetch } = useFetch(() => listCategories(), []);
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCategory(editingId, { name, description });
        showToast("Catégorie mise à jour.", "success");
      } else {
        await createCategory({ name, description });
        showToast("Catégorie créée.", "success");
      }
      setName("");
      setDescription("");
      setEditingId(null);
      refetch();
    } catch {
      showToast("Une erreur est survenue.", "error");
    }
  }

  function startEdit(category) {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description || "");
  }

  async function handleDelete() {
    try {
      await deleteCategory(categoryToDelete.id);
      showToast("Catégorie supprimée.", "success");
      refetch();
    } catch {
      showToast("Impossible de supprimer une catégorie contenant des produits.", "error");
    } finally {
      setCategoryToDelete(null);
    }
  }

  const columns = [
    { key: "name", header: "Nom" },
    { key: "description", header: "Description", render: (c) => c.description || "—" },
    {
      key: "actions",
      header: "Actions",
      render: (c) => (
        <div className={styles.actions}>
          <button type="button" onClick={() => startEdit(c)}>
            Modifier
          </button>
          <button type="button" className={styles.deleteAction} onClick={() => setCategoryToDelete(c)}>
            Supprimer
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1>Catégories</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <TextField label="Nom de la catégorie" required value={name} onChange={setName} />
        <TextField label="Description" value={description} onChange={setDescription} />
        <Button type="submit">{editingId ? "Mettre à jour" : "Ajouter"}</Button>
        {editingId && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setEditingId(null);
              setName("");
              setDescription("");
            }}
          >
            Annuler
          </Button>
        )}
      </form>

      {isLoading ? (
        <Loader />
      ) : (
        <DataTable columns={columns} data={response?.data || []} rowKey={(c) => c.id} />
      )}

      <ConfirmDialog
        isOpen={Boolean(categoryToDelete)}
        title="Supprimer cette catégorie ?"
        message={`Voulez-vous vraiment supprimer « ${categoryToDelete?.name} » ?`}
        onConfirm={handleDelete}
        onCancel={() => setCategoryToDelete(null)}
      />
    </div>
  );
}
