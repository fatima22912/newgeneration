import { Link, useLocation, useParams } from "react-router-dom";
import { formatPrice } from "../../utils/formatters";
import { ORDER_STATUS_LABELS, STORE } from "../../utils/constants";
import Button from "../../components/common/Button";
import styles from "./OrderConfirmation.module.css";

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const order = location.state?.order;

  return (
    <div className={`container ${styles.wrapper}`}>
      <h1>Commande confirmée</h1>
      <p className={styles.orderNumber}>
        Numéro de commande : <strong>{orderNumber}</strong>
      </p>
      <p>Conservez ce numéro : il vous sera utile pour toute question sur votre commande.</p>

      {order && (
        <div className={styles.summary}>
          <p>Statut : {ORDER_STATUS_LABELS[order.status]}</p>
          <p>Total : {formatPrice(order.total_amount)}</p>
          <p>Adresse de livraison : {order.customer_address}</p>
        </div>
      )}

      <p className={styles.contactNote}>
        Pour toute question, contactez-nous au {STORE.phones.join(" ou ")}.
      </p>

      <div className={styles.actions}>
        <Link to="/catalogue">
          <Button>Continuer mes achats</Button>
        </Link>
      </div>
    </div>
  );
}
