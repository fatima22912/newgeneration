import { formatPrice } from "../../utils/formatters";
import styles from "./CartItemRow.module.css";

export default function CartItemRow({ item, onQuantityChange, onRemove }) {
  const subtotal = parseFloat(item.unit_price) * item.quantity;

  return (
    <div className={styles.row}>
      <div className={styles.imageWrapper}>
        {item.image_url ? (
          <img src={item.image_url} alt={item.product_name} />
        ) : (
          <span aria-hidden="true">Photo</span>
        )}
      </div>

      <div className={styles.details}>
        <p className={styles.name}>{item.product_name}</p>
        <p className={styles.variant}>
          {item.color} · {item.size}
        </p>
        <p className={styles.unitPrice}>{formatPrice(item.unit_price)}</p>
      </div>

      <div className={styles.quantityControl}>
        <button
          type="button"
          onClick={() => onQuantityChange(item.product_variant_id, item.quantity - 1)}
          disabled={item.quantity <= 1}
          aria-label={`Diminuer la quantité de ${item.product_name}`}
        >
          −
        </button>
        <span aria-live="polite">{item.quantity}</span>
        <button
          type="button"
          onClick={() => onQuantityChange(item.product_variant_id, item.quantity + 1)}
          disabled={item.quantity >= item.max_stock}
          aria-label={`Augmenter la quantité de ${item.product_name}`}
        >
          +
        </button>
      </div>

      <span className={styles.subtotal}>{formatPrice(subtotal)}</span>

      <button
        type="button"
        className={styles.removeButton}
        onClick={() => onRemove(item.product_variant_id)}
      >
        Retirer
      </button>
    </div>
  );
}
