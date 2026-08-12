import { useId, useState } from "react";
import { resolveImageUrl } from "../../utils/media";
import styles from "./ImageUploader.module.css";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

export default function ImageUploader({ images = [], onUpload, isUploading }) {
  const id = useId();
  const [error, setError] = useState(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Format non supporté (jpeg, png ou webp uniquement).");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${MAX_SIZE_MB} Mo).`);
      return;
    }
    setError(null);
    onUpload(file);
  }

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Photos du produit</h3>

      <div className={styles.grid}>
        {images.map((image) => (
          <img key={image.id} src={resolveImageUrl(image.image_url)} alt="" className={styles.thumb} />
        ))}
        {images.length === 0 && <p className={styles.placeholder}>Aucune photo pour l'instant.</p>}
      </div>

      <label htmlFor={id} className={styles.uploadLabel} aria-disabled={isUploading}>
        {isUploading ? "Envoi en cours..." : "Ajouter une photo"}
      </label>
      <input
        id={id}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFileChange}
        disabled={isUploading}
        className="visually-hidden"
      />

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
    </div>
  );
}
