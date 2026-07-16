import { Link } from "react-router-dom";
import styles from "./CategoryNav.module.css";

export default function CategoryNav({ categories }) {
  return (
    <nav aria-label="Catégories de produits" className={styles.nav}>
      <ul className={styles.list}>
        {categories.map((category) => (
          <li key={category.id}>
            <Link to={`/catalogue?category=${category.slug}`} className={styles.link}>
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
