import Breadcrumb from "../../../components/common/Breadcrumb";
import styles from "../StaticPage.module.css";

export default function TermsOfSale() {
  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "Conditions générales de vente" }]} />
      <h1>Conditions générales de vente</h1>

      <h2>Commandes</h2>
      <p>
        Les commandes sont passées sans obligation de création de compte. Un numéro de commande
        unique est communiqué à la validation.
      </p>

      <h2>Paiement</h2>
      <p>Le paiement s'effectue via Wave, Orange Money, ou directement en boutique.</p>

      <h2>Livraison</h2>
      <p>
        À Dakar, la livraison s'effectue sous un délai maximum de 48h. Dans les régions, comptez
        3 à 5 jours maximum. Pour l'international, la livraison se fait sous le contrôle d'un GP
        (Go and Pay).
      </p>
      <p>Le prix de la livraison varie selon la zone.</p>
    </div>
  );
}
