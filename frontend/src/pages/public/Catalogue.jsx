import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { listAllProducts } from "../../services/api/productService";
import ProductCard from "../../components/public/ProductCard";
import SortSelector from "../../components/public/SortSelector";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import Breadcrumb from "../../components/common/Breadcrumb";
import LookbookStrip from "../../components/public/LookbookStrip";
import styles from "./Catalogue.module.css";

export default function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => ({
      category: searchParams.get("category") || undefined,
      size: searchParams.get("size") || undefined,
      color: searchParams.get("color") || undefined,
      min_price: searchParams.get("min_price") || undefined,
      max_price: searchParams.get("max_price") || undefined,
      search: searchParams.get("search") || undefined,
      sort: searchParams.get("sort") || "newest",
    }),
    [searchParams],
  );

  const { data: productsResponse, isLoading } = useFetch(
    () => listAllProducts(filters),
    [JSON.stringify(filters)],
  );

  function updateParams(nextFilters) {
    const params = {};
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    setSearchParams(params);
  }

  const products = productsResponse?.data || [];
  const meta = productsResponse?.meta;

  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "Catalogue" }]} />
      <h1>Catalogue</h1>

      <div className={styles.resultsHeader}>
        <span aria-live="polite">{meta ? `${meta.total} produit(s)` : ""}</span>
        <SortSelector value={filters.sort} onChange={(sort) => updateParams({ ...filters, sort })} />
      </div>

      {isLoading ? (
        <Loader />
      ) : products.length === 0 ? (
        <EmptyState message="Aucun produit ne correspond à votre recherche." />
      ) : (
        <>
          <div className={styles.grid}>
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} animationIndex={index} />
            ))}
          </div>
        </>
      )}

      <LookbookStrip />
    </div>
  );
}
