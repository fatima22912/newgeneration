import { Link } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { listProducts } from "../../services/api/productService";
import { listCategories } from "../../services/api/categoryService";
import ProductCard from "../../components/public/ProductCard";
import CategoryNav from "../../components/public/CategoryNav";
import LookbookStrip from "../../components/public/LookbookStrip";
import Loader from "../../components/common/Loader";
import heroPhoto from "../../assets/lookbook/shoot-08.jpeg";
import heroLogo from "../../assets/images/logo-marque-dark.png";
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
      <section className={styles.hero} aria-labelledby="home-hero-title">
        <img className={styles.heroPhoto} src={heroPhoto} alt="" fetchPriority="high" />
        <div className={styles.heroShade} aria-hidden="true" />
        <img className={styles.heroLogo} src={heroLogo} alt="" aria-hidden="true" />

        <div className={`container ${styles.heroInner}`}>
          <p className={styles.heroEyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            New Generation <span aria-hidden="true">·</span> Dakar
          </p>
          <h1 id="home-hero-title" className={styles.heroTitle}>
            Bienvenue dans<br />
            <span>notre génération.</span>
          </h1>
          <p className={styles.heroText}>
            Le style urbain, l’énergie de Dakar, une génération qui avance à sa façon.
          </p>
          <div className={styles.heroActions}>
            <Link to="/catalogue" className={styles.heroLink}>
              Découvrir la collection <span aria-hidden="true">↗</span>
            </Link>
            <Link to="/a-propos" className={styles.heroStoryLink}>
              Notre histoire
            </Link>
          </div>
        </div>

        <a className={styles.scrollCue} href="#home-categories" aria-label="Défiler vers les catégories">
          <span className={styles.scrollCueLine} aria-hidden="true" />
          <span>Explorer</span>
        </a>
        <p className={styles.heroSideNote} aria-hidden="true">YOUTH WRITES ITS STORY</p>
      </section>

      <section id="home-categories" className={`container ${styles.section}`}>
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

      <LookbookStrip />
    </div>
  );
}
