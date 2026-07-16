import { Link } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { listProducts } from "../../services/api/productService";
import { listCategories } from "../../services/api/categoryService";
import ProductCard from "../../components/public/ProductCard";
import CategoryNav from "../../components/public/CategoryNav";
import Loader from "../../components/common/Loader";
import styles from "./Home.module.css";

export default function Home() {
  const { data: productsResponse, isLoading: productsLoading } = useFetch(
    () => listProducts({ sort: "newest", page_size: 8 }),
    [],
  );
  const { data: categoriesResponse, isLoading: categoriesLoading } = useFetch(
    () => listCategories(),
    [],
  );

  return (
    <div>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <h1 className={styles.heroTitle}>Le style New Generation</h1>
          <p className={styles.heroText}>
            New Generation est une marque de prêt-à-porter urbain qui reflète l'énergie de la
            jeunesse et le goût de l'élégance — pensée à Dakar, portée par une nouvelle
            génération.
          </p>
          <Link to="/catalogue" className={styles.heroLink}>
            Voir le catalogue
          </Link>
        </div>
      </section>

      <section className={`container ${styles.section}`}>
        <h2 className={styles.sectionTitle}>Catégories</h2>
        {categoriesLoading ? (
          <Loader />
        ) : (
          <CategoryNav categories={categoriesResponse?.data || []} />
        )}
      </section>

      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Nouveautés</h2>
          <Link to="/catalogue">Voir tout le catalogue</Link>
        </div>
        {productsLoading ? (
          <Loader />
        ) : (
          <div className={styles.grid}>
            {(productsResponse?.data || []).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
