import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { listProducts } from "../../services/api/productService";
import ProductCard from "../../components/public/ProductCard";
import SortSelector from "../../components/public/SortSelector";
import Pagination from "../../components/common/Pagination";
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
      page: Number(searchParams.get("page")) || 1,
    }),
    [searchParams],
  );

  const { data: productsResponse, isLoading } = useFetch(
    () => listProducts({ ...filters, page_size: 12 }),
    [JSON.stringify(filters)],
  );

  function updateParams(nextFilters) {
    const params = {};
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    params.page = 1;
    setSearchParams(params);
  }

  function goToPage(page) {
    setSearchParams({ ...Object.fromEntries(searchParams), page });
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
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination page={meta.page} totalPages={meta.total_pages} onPageChange={goToPage} />
        </>
      )}

      <LookbookStrip />
    </div>
  );
}
