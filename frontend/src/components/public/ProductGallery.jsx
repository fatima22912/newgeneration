import { useState } from "react";
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
      <img src={activeImage.image_url} alt={productName} className={styles.mainImage} />
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
              <img src={image.image_url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
