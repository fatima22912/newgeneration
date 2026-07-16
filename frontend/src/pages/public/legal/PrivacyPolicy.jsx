import Breadcrumb from "../../../components/common/Breadcrumb";
import styles from "../StaticPage.module.css";

export default function PrivacyPolicy() {
  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "Confidentialité" }]} />
      <h1>Politique de confidentialité</h1>

      <p className={styles.placeholderNote}>
        [Contenu temporaire — la politique de confidentialité définitive sera fournie
        séparément par la boutique.]
      </p>

      <h2>Données collectées</h2>
      <p>
        Lors d'une commande, nous collectons uniquement le nom, le téléphone et l'adresse de
        livraison nécessaires à son traitement. Aucune donnée n'est requise pour naviguer sur le
        site.
      </p>

      <h2>Utilisation des données</h2>
      <p>Ces données servent exclusivement au traitement et au suivi de votre commande.</p>
    </div>
  );
}
