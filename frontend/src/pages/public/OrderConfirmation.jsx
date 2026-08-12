import { Link, useLocation, useParams } from "react-router-dom";
import { formatPrice } from "../../utils/formatters";
import { FULFILLMENT_METHOD_LABELS, ORDER_STATUS_LABELS, STORE } from "../../utils/constants";
import Button from "../../components/common/Button";
import styles from "./OrderConfirmation.module.css";

function buildWhatsappUrl(orderNumber, order) {
  const digits = STORE.phones[0].replace(/\s+/g, "");
  const lines = [
    `Bonjour, je viens de payer ma commande ${orderNumber}.`,
    order ? `Total : ${formatPrice(order.total_amount)}.` : null,
    "Je joins la capture d'écran de mon paiement Wave / Orange Money en pièce jointe.",
  ].filter(Boolean);
  return `https://wa.me/221${digits}?text=${encodeURIComponent(lines.join(" "))}`;
}

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

      {(!order || order.payment_method !== "cash_on_delivery") && (
        <div className={styles.whatsappBox}>
          <p>
            Après avoir payé via Wave ou Orange Money, envoyez-nous la capture d'écran de votre
            paiement sur WhatsApp pour accélérer la validation de votre commande.
          </p>
          <a
            href={buildWhatsappUrl(orderNumber, order)}
            target="_blank"
            rel="noreferrer"
            className={styles.whatsappLink}
          >
            Envoyer sur WhatsApp
          </a>
        </div>
      )}

      {order && (
        <div className={styles.summary}>
          <p>Statut : {ORDER_STATUS_LABELS[order.status]}</p>
          <p>Total : {formatPrice(order.total_amount)}</p>
          <p>Réception : {FULFILLMENT_METHOD_LABELS[order.fulfillment_method] || "Livraison"}</p>
          {order.customer_address ? (
            <p>Adresse de livraison : {order.customer_address}</p>
          ) : (
            <p>À récupérer : {STORE.addresses.join(" · ")}</p>
          )}
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
