import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/formatters";
import { resolveImageUrl } from "../../utils/media";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const image = resolveImageUrl(product.images?.[0]?.image_url);
  const hoverImage = resolveImageUrl(product.images?.[1]?.image_url);
  const totalStock = (product.variants || []).reduce((sum, v) => sum + v.stock_quantity, 0);

  return (
    <Link to={`/produits/${product.slug}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {image ? (
          <>
            <img src={image} alt={product.name} className={styles.image} />
            {hoverImage && <img src={hoverImage} alt="" className={styles.imageSecondary} />}
          </>
        ) : (
          <div className={styles.placeholder} aria-hidden="true">
            Photo à venir
          </div>
        )}
        {totalStock === 0 && <span className={styles.badgeOut}>Épuisé</span>}
      </div>
      <div className={styles.info}>
        <span className={styles.category}>{product.category?.name}</span>
        <h3 className={styles.name}>{product.name}</h3>
        <span className={styles.price}>{formatPrice(product.base_price)}</span>
      </div>
    </Link>
  );
}
