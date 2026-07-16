import styles from "./StockAlertBanner.module.css";

export default function StockAlertBanner({ variants }) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className={styles.banner} role="status">
      <p className={styles.title}>Stock bas sur {variants.length} référence(s)</p>
      <ul className={styles.list}>
        {variants.map((v) => (
          <li key={`${v.product_variant_id}-${v.size}-${v.color}`}>
            {v.product_name} ({v.color}, {v.size}) — {v.stock_quantity} restant(s)
          </li>
        ))}
      </ul>
    </div>
  );
}
