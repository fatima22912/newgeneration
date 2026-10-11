import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/formatters";
import { resolveImageUrl } from "../../utils/media";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product, animationIndex = 0 }) {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const image = resolveImageUrl(product.images?.[0]?.image_url);
  const hoverImage = resolveImageUrl(product.images?.[1]?.image_url);
  const totalStock = (product.variants || []).reduce((sum, v) => sum + v.stock_quantity, 0);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return undefined;

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <Link
      ref={cardRef}
      to={`/produits/${product.slug}`}
      className={`${styles.card} ${isVisible ? styles.visible : ""}`}
      style={{ "--card-delay": `${(animationIndex % 4) * 90}ms` }}
    >
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
