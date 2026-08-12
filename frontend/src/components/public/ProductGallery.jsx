import { useState } from "react";
import { resolveImageUrl } from "../../utils/media";
import styles from "./ProductGallery.module.css";

export default function ProductGallery({ images = [], productName }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className={styles.mainPlaceholder} aria-hidden="true">
        Photo à venir
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className={styles.gallery}>
      <img src={resolveImageUrl(activeImage.image_url)} alt={productName} className={styles.mainImage} />
      {images.length > 1 && (
        <div className={styles.thumbnails}>
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              className={index === activeIndex ? styles.thumbActive : styles.thumb}
              onClick={() => setActiveIndex(index)}
              aria-label={`Voir la photo ${index + 1} de ${productName}`}
              aria-current={index === activeIndex}
            >
              <img src={resolveImageUrl(image.image_url)} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
