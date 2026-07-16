import { formatPrice } from "../../utils/formatters";
import styles from "./CartSummary.module.css";

export default function CartSummary({ totalAmount, itemCount, children }) {
  return (
    <div className={styles.summary}>
      <h2 className={styles.title}>Récapitulatif</h2>
      <div className={styles.row}>
        <span>Articles ({itemCount})</span>
        <span>{formatPrice(totalAmount)}</span>
      </div>
      <div className={styles.row}>
        <span>Livraison</span>
        <span>À confirmer par la boutique</span>
      </div>
      <div className={styles.totalRow}>
        <span>Total</span>
        <span>{formatPrice(totalAmount)}</span>
      </div>
      {children}
    </div>
  );
}
