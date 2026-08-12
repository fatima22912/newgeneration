import TextField from "../common/TextField";
import Button from "../common/Button";
import waveLogoUrl from "../../assets/images/payment-wave.jpeg";
import orangeMoneyLogoUrl from "../../assets/images/payment-orange-money.jpeg";
import orangeMoneyQrUrl from "../../assets/images/payment-orange-money-qr.jpeg";
import { FULFILLMENT_METHODS, PAYMENT_METHODS, STORE } from "../../utils/constants";
import styles from "./CheckoutForm.module.css";

const PAYMENT_LOGOS = {
  wave: waveLogoUrl,
  orange_money: orangeMoneyLogoUrl,
};

// Aucune passerelle de paiement n'est connectée (lien Wave manuel, pas de
// numéro marchand Orange Money) : impossible de vérifier automatiquement
// qu'un paiement a bien été reçu. Le client doit donc payer PUIS confirmer
// explicitement avant de pouvoir valider — la boutique vérifie ensuite
// réellement la réception avant de traiter la commande.
function isPaymentStepDone(values) {
  return Boolean(values.payment_confirmed);
}

export default function CheckoutForm({ values, errors, onChange, onSubmit, isSubmitting }) {
  const paymentReady = isPaymentStepDone(values);

  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        if (!paymentReady) return;
        onSubmit();
      }}
    >
      <h2 className={styles.sectionTitle}>1. Mode de réception</h2>
      <div className={styles.paymentOptions} role="radiogroup" aria-label="Mode de réception">
        {FULFILLMENT_METHODS.map((method) => (
          <label
            key={method.value}
            className={
              values.fulfillment_method === method.value
                ? styles.paymentOptionActive
                : styles.paymentOption
            }
          >
            <input
              type="radio"
              name="fulfillment_method"
              value={method.value}
              checked={values.fulfillment_method === method.value}
              onChange={() => onChange("fulfillment_method", method.value)}
            />
            <span>{method.label}</span>
          </label>
        ))}
      </div>
      {values.fulfillment_method === "pickup" && (
        <p className={styles.paymentNote}>
          À récupérer dans l'une de nos boutiques : {STORE.addresses.join(" · ")}.
        </p>
      )}

      <h2 className={styles.sectionTitle}>2. Vos informations</h2>
      <TextField
        label="Nom complet"
        required
        value={values.customer_name}
        onChange={(v) => onChange("customer_name", v)}
        error={errors.customer_name}
      />
      <TextField
        label="Téléphone"
        type="tel"
        required
        value={values.customer_phone}
        onChange={(v) => onChange("customer_phone", v)}
        error={errors.customer_phone}
        hint="Utilisé pour vous contacter et pour le suivi de votre commande."
      />
      {values.fulfillment_method === "delivery" && (
        <TextField
          label="Adresse de livraison"
          required
          value={values.customer_address}
          onChange={(v) => onChange("customer_address", v)}
          error={errors.customer_address}
        />
      )}

      <h2 className={styles.sectionTitle}>3. Mode de paiement</h2>
      <div className={styles.paymentOptions} role="radiogroup" aria-label="Mode de paiement">
        {PAYMENT_METHODS.map((method) => (
          <label
            key={method.value}
            className={
              values.payment_method === method.value ? styles.paymentOptionActive : styles.paymentOption
            }
          >
            <input
              type="radio"
              name="payment_method"
              value={method.value}
              checked={values.payment_method === method.value}
              onChange={() => {
                onChange("payment_method", method.value);
                onChange("payment_confirmed", false);
              }}
              className="visually-hidden"
            />
            {PAYMENT_LOGOS[method.value] && (
              <img src={PAYMENT_LOGOS[method.value]} alt="" className={styles.paymentLogo} />
            )}
            {method.value === "wave" ? (
              <a
                href={STORE.wavePaymentUrl}
                target="_blank"
                rel="noreferrer"
                className={styles.paymentOptionLink}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("payment_method", "wave");
                  onChange("payment_confirmed", false);
                }}
              >
                Payer avec Wave
              </a>
            ) : (
              <span>{method.label}</span>
            )}
          </label>
        ))}
      </div>

      {values.payment_method === "wave" && (
        <div className={styles.paymentStep}>
          <p className={styles.paymentNote}>
            Le lien Wave s'est ouvert dans un nouvel onglet. Une fois le paiement effectué,
            confirmez ci-dessous pour pouvoir valider votre commande.
          </p>
          <label className={styles.confirmRow}>
            <input
              type="checkbox"
              checked={Boolean(values.payment_confirmed)}
              onChange={(e) => onChange("payment_confirmed", e.target.checked)}
            />
            J'ai effectué le paiement via Wave
          </label>
        </div>
      )}
      {values.payment_method === "orange_money" && (
        <div className={styles.paymentStep}>
          <p className={styles.paymentNote}>
            Scannez ce code avec votre application Orange Money pour payer le montant total, puis
            confirmez ci-dessous pour pouvoir valider votre commande.
          </p>
          <img
            src={orangeMoneyQrUrl}
            alt="Code QR Orange Money à scanner pour payer"
            className={styles.qrCode}
          />
          <label className={styles.confirmRow}>
            <input
              type="checkbox"
              checked={Boolean(values.payment_confirmed)}
              onChange={(e) => onChange("payment_confirmed", e.target.checked)}
            />
            J'ai effectué le paiement Orange Money
          </label>
        </div>
      )}
      <Button type="submit" fullWidth disabled={isSubmitting || !paymentReady}>
        {isSubmitting ? "Validation en cours..." : "Valider la commande"}
      </Button>
      {!paymentReady && (
        <p className={styles.gateHint} role="status">
          Confirmez le paiement ci-dessus pour activer la validation.
        </p>
      )}
    </form>
  );
}
