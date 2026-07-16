import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "../../hooks/useForm";
import { useCart } from "../../hooks/useCart";
import { useToast } from "../../components/common/ToastProvider";
import { createOrder } from "../../services/api/orderService";
import CheckoutForm from "../../components/public/CheckoutForm";
import CartSummary from "../../components/public/CartSummary";
import Breadcrumb from "../../components/common/Breadcrumb";
import { isRequired, isValidPhone, minLength } from "../../utils/validators";
import styles from "./Checkout.module.css";

function validate(values) {
  const errors = {};
  if (!isRequired(values.customer_name)) errors.customer_name = "Le nom est requis.";
  if (!isValidPhone(values.customer_phone)) errors.customer_phone = "Numéro de téléphone invalide.";
  if (!minLength(values.customer_address, 5)) errors.customer_address = "Adresse trop courte.";
  return errors;
}

export default function Checkout() {
  const { items, totalAmount, totalQuantity, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm(
    {
      customer_name: "",
      customer_phone: "",
      customer_address: "",
      payment_method: "wave",
      payment_confirmed: false,
    },
    validate,
  );

  useEffect(() => {
    if (items.length === 0) navigate("/panier");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitOrder() {
    try {
      const payload = {
        customer_name: values.customer_name,
        customer_phone: values.customer_phone,
        customer_address: values.customer_address,
        payment_method: values.payment_method,
        items: items.map((item) => ({
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
        })),
      };
      const response = await createOrder(payload);
      clearCart();
      navigate(`/confirmation/${response.data.order_number}`, { state: { order: response.data } });
    } catch (err) {
      const message =
        err.response?.data?.error?.message || "Une erreur est survenue lors de la commande.";
      showToast(message, "error");
    }
  }

  return (
    <div className="container">
      <Breadcrumb
        items={[{ label: "Accueil", to: "/" }, { label: "Panier", to: "/panier" }, { label: "Commande" }]}
      />
      <h1>Finaliser la commande</h1>

      <div className={styles.layout}>
        <CheckoutForm
          values={values}
          errors={errors}
          onChange={handleChange}
          onSubmit={() => handleSubmit(submitOrder)}
          isSubmitting={isSubmitting}
        />
        <CartSummary totalAmount={totalAmount} itemCount={totalQuantity} />
      </div>
    </div>
  );
}
