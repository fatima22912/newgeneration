import { useEffect, useMemo, useState } from "react";
import styles from "./ProductVariantSelector.module.css";

export default function ProductVariantSelector({ variants, onChange }) {
  const sizes = useMemo(() => [...new Set(variants.map((v) => v.size))], [variants]);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");

  const colorsForSize = useMemo(
    () => variants.filter((v) => v.size === selectedSize),
    [variants, selectedSize],
  );
  const [selectedColor, setSelectedColor] = useState(colorsForSize[0]?.color || "");
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = variants.find((v) => v.size === selectedSize && v.color === selectedColor);

  // Informe le parent de la sélection par défaut dès le montage, sinon le
  // bouton "Ajouter au panier" resterait désactivé tant que l'utilisateur
  // n'a pas re-cliqué une taille/couleur déjà présélectionnée à l'écran.
  useEffect(() => {
    onChange?.({ variant: selectedVariant, quantity: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variants]);

  function handleSizeChange(size) {
    setSelectedSize(size);
    const firstColor = variants.find((v) => v.size === size);
    setSelectedColor(firstColor?.color || "");
    setQuantity(1);
    onChange?.({ variant: firstColor, quantity: 1 });
  }

  function handleColorChange(color) {
    setSelectedColor(color);
    setQuantity(1);
    const variant = variants.find((v) => v.size === selectedSize && v.color === color);
    onChange?.({ variant, quantity: 1 });
  }

  function handleQuantityChange(nextQuantity) {
    const max = selectedVariant?.stock_quantity ?? 0;
    const clamped = Math.min(Math.max(1, nextQuantity), Math.max(1, max));
    setQuantity(clamped);
    onChange?.({ variant: selectedVariant, quantity: clamped });
  }

  return (
    <div className={styles.selector}>
      <fieldset className={styles.group}>
        <legend className={styles.legend}>Taille</legend>
        <div className={styles.options}>
          {sizes.map((size) => (
            <button
              key={size}
              type="button"
              className={size === selectedSize ? styles.optionActive : styles.option}
              onClick={() => handleSizeChange(size)}
              aria-pressed={size === selectedSize}
            >
              {size}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Couleur</legend>
        <div className={styles.options}>
          {colorsForSize.map((v) => (
            <button
              key={v.color}
              type="button"
              className={v.color === selectedColor ? styles.optionActive : styles.option}
              onClick={() => handleColorChange(v.color)}
              aria-pressed={v.color === selectedColor}
              disabled={v.stock_quantity === 0}
            >
              {v.color}
              {v.stock_quantity === 0 ? " (épuisé)" : ""}
            </button>
          ))}
        </div>
      </fieldset>

      <div className={styles.group}>
        <label htmlFor="quantity" className={styles.legend}>
          Quantité
        </label>
        <div className={styles.quantityControl}>
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            aria-label="Diminuer la quantité"
          >
            −
          </button>
          <span id="quantity" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={!selectedVariant || quantity >= selectedVariant.stock_quantity}
            aria-label="Augmenter la quantité"
          >
            +
          </button>
        </div>
        <p className={styles.stockInfo}>
          {selectedVariant
            ? selectedVariant.stock_quantity > 0
              ? `${selectedVariant.stock_quantity} en stock`
              : "Rupture de stock"
            : "Sélectionnez une taille et une couleur"}
        </p>
      </div>
    </div>
  );
}
