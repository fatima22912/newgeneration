import { useState } from "react";
import { useParams } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { useToast } from "../../components/common/ToastProvider";
import { getOrder, updateOrderStatus } from "../../services/api/orderService";
import OrderStatusStepper from "../../components/owner/OrderStatusStepper";
import Loader from "../../components/common/Loader";
import Breadcrumb from "../../components/common/Breadcrumb";
import { formatDateTime, formatPrice } from "../../utils/formatters";
import { FULFILLMENT_METHOD_LABELS, PAYMENT_METHODS } from "../../utils/constants";
import styles from "./OrderDetail.module.css";

export default function OrderDetail() {
  const { id } = useParams();
  const { showToast } = useToast();
  const { data: response, isLoading, refetch } = useFetch(() => getOrder(id), [id]);
  const [isUpdating, setIsUpdating] = useState(false);

  if (isLoading) return <Loader />;
  const order = response?.data;
  if (!order) return <p>Commande introuvable.</p>;

  async function handleChangeStatus(nextStatus) {
    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, nextStatus);
      showToast("Statut mis à jour.", "success");
      refetch();
    } catch {
      showToast("Impossible de mettre à jour le statut.", "error");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div>
      <Breadcrumb items={[{ label: "Commandes", to: "/proprietaire/commandes" }, { label: order.order_number }]} />
      <h1>Commande {order.order_number}</h1>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>Client</h2>
          <p>{order.customer_name}</p>
          <p>{order.customer_phone}</p>
          <p>Réception : {FULFILLMENT_METHOD_LABELS[order.fulfillment_method] || "Livraison"}</p>
          {order.fulfillment_method === "pickup" ? (
            <p>Retrait en boutique</p>
          ) : (
            <p>{order.customer_address}</p>
          )}
          <p>Passée le {formatDateTime(order.created_at)}</p>
          <p>Paiement : {PAYMENT_METHODS.find((p) => p.value === order.payment_method)?.label}</p>
        </section>

        <section className={styles.card}>
          <h2>Statut</h2>
          <OrderStatusStepper status={order.status} onChangeStatus={handleChangeStatus} isUpdating={isUpdating} />
        </section>
      </div>

      <section className={styles.card}>
        <h2>Articles</h2>
        <table className={styles.itemsTable}>
          <thead>
            <tr>
              <th scope="col">Produit</th>
              <th scope="col">Variante</th>
              <th scope="col">Quantité</th>
              <th scope="col">Prix unitaire</th>
              <th scope="col">Sous-total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.product_name}</td>
                <td>
                  {item.color}, {item.size}
                </td>
                <td>{item.quantity}</td>
                <td>{formatPrice(item.unit_price)}</td>
                <td>{formatPrice(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={styles.total}>Total : {formatPrice(order.total_amount)}</p>
      </section>
    </div>
  );
}
