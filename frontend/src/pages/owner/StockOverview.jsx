import { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import { listProducts } from "../../services/api/productService";
import DataTable from "../../components/common/DataTable";
import Loader from "../../components/common/Loader";
import styles from "./StockOverview.module.css";

const LOW_STOCK_THRESHOLD = 5;

export default function StockOverview() {
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const { data: response, isLoading } = useFetch(
    () => listProducts({ page_size: 100, include_inactive: true }),
    [],
  );

  const variantRows = (response?.data || []).flatMap((product) =>
    product.variants.map((variant) => ({ ...variant, productName: product.name })),
  );

  const filteredRows = lowStockOnly
    ? variantRows.filter((v) => v.stock_quantity <= LOW_STOCK_THRESHOLD)
    : variantRows;

  const columns = [
    { key: "productName", header: "Produit" },
    { key: "size", header: "Taille" },
    { key: "color", header: "Couleur" },
    { key: "sku", header: "SKU" },
    {
      key: "stock_quantity",
      header: "Stock",
      render: (v) => (
        <span className={v.stock_quantity <= LOW_STOCK_THRESHOLD ? styles.lowStock : undefined}>
          {v.stock_quantity}
        </span>
      ),
    },
  ];

  if (isLoading) return <Loader />;

  return (
    <div>
      <h1>Stock</h1>

      <label className={styles.filter}>
        <input
          type="checkbox"
          checked={lowStockOnly}
          onChange={(e) => setLowStockOnly(e.target.checked)}
        />
        Afficher uniquement le stock bas (≤ {LOW_STOCK_THRESHOLD})
      </label>

      <DataTable
        columns={columns}
        data={filteredRows}
        rowKey={(v) => v.id}
        emptyMessage="Aucune variante à afficher."
      />
    </div>
  );
}
