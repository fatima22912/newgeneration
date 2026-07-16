import { useState } from "react";
import { Link } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { usePagination } from "../../hooks/usePagination";
import { useDebounce } from "../../hooks/useDebounce";
import { useToast } from "../../components/common/ToastProvider";
import { listProducts, deleteProduct, duplicateProduct } from "../../services/api/productService";
import DataTable from "../../components/common/DataTable";
import Pagination from "../../components/common/Pagination";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Loader from "../../components/common/Loader";
import { formatPrice } from "../../utils/formatters";
import styles from "./ProductList.module.css";

export default function ProductList() {
  const { page, goToPage } = usePagination();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [productToDelete, setProductToDelete] = useState(null);
  const { showToast } = useToast();

  const { data: response, isLoading, refetch } = useFetch(
    () => listProducts({ search: debouncedSearch || undefined, page, page_size: 10, include_inactive: true }),
    [debouncedSearch, page],
  );

  async function handleDelete() {
    await deleteProduct(productToDelete.id);
    showToast("Produit supprimé.", "success");
    setProductToDelete(null);
    refetch();
  }

  async function handleDuplicate(product) {
    await duplicateProduct(product.id);
    showToast("Produit dupliqué.", "success");
    refetch();
  }

  const columns = [
    { key: "name", header: "Produit", render: (p) => p.name },
    { key: "category", header: "Catégorie", render: (p) => p.category.name },
    { key: "price", header: "Prix", render: (p) => formatPrice(p.base_price) },
    {
      key: "status",
      header: "Statut",
      render: (p) => (p.is_active ? "Actif" : "Inactif"),
    },
    {
      key: "actions",
      header: "Actions",
      render: (p) => (
        <div className={styles.actions}>
          <Link to={`/proprietaire/produits/${p.id}`}>Modifier</Link>
          <button type="button" onClick={() => handleDuplicate(p)}>
            Dupliquer
          </button>
          <button type="button" className={styles.deleteAction} onClick={() => setProductToDelete(p)}>
            Supprimer
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className={styles.header}>
        <h1>Produits</h1>
        <Link to="/proprietaire/produits/nouveau">
          <Button>Nouveau produit</Button>
        </Link>
      </div>

      <input
        type="search"
        className={styles.search}
        placeholder="Rechercher un produit..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Rechercher un produit"
      />

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <DataTable
            columns={columns}
            data={response?.data || []}
            rowKey={(p) => p.id}
            emptyMessage="Aucun produit pour l'instant."
          />
          <Pagination
            page={response?.meta.page || 1}
            totalPages={response?.meta.total_pages || 1}
            onPageChange={(p) => goToPage(p, response?.meta.total_pages)}
          />
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(productToDelete)}
        title="Supprimer ce produit ?"
        message={`Voulez-vous vraiment supprimer « ${productToDelete?.name} » ? Cette action est irréversible si le produit n'a jamais été commandé.`}
        onConfirm={handleDelete}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}
