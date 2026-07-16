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
