import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import CartItemRow from "../../components/public/CartItemRow";
import CartSummary from "../../components/public/CartSummary";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import Breadcrumb from "../../components/common/Breadcrumb";
import styles from "./Cart.module.css";

export default function Cart() {
  const { items, updateQuantity, removeItem, totalAmount, totalQuantity } = useCart();
  const navigate = useNavigate();

  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "Panier" }]} />
      <h1>Votre panier</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={
            <svg
              viewBox="0 0 24 24"
              width="48"
              height="48"
              aria-hidden="true"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          }
          message="Votre panier est vide."
          action={
            <Link to="/catalogue">
              <Button>Voir le catalogue</Button>
            </Link>
          }
        />
      ) : (
        <div className={styles.layout}>
          <div className={styles.items}>
            {items.map((item) => (
              <CartItemRow
                key={item.product_variant_id}
                item={item}
                onQuantityChange={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <CartSummary totalAmount={totalAmount} itemCount={totalQuantity}>
            <Button fullWidth onClick={() => navigate("/commande")}>
              Passer la commande
            </Button>
          </CartSummary>
        </div>
      )}
    </div>
  );
}
