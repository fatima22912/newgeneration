import Breadcrumb from "../../../components/common/Breadcrumb";
import styles from "../StaticPage.module.css";

export default function TermsOfSale() {
  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "Conditions générales de vente" }]} />
      <h1>Conditions générales de vente</h1>

      <p className={styles.placeholderNote}>
        [Contenu temporaire — les conditions générales de vente définitives seront fournies
        séparément par la boutique.]
      </p>

      <h2>Commandes</h2>
      <p>
        Les commandes sont passées sans obligation de création de compte. Un numéro de commande
        unique est communiqué à la validation.
      </p>

      <h2>Paiement</h2>
      <p>Le paiement s'effectue via Wave, Orange Money, ou directement en boutique.</p>

      <h2>Livraison</h2>
      <p className={styles.placeholderNote}>[Modalités de livraison à préciser.]</p>
    </div>
  );
}
