import Breadcrumb from "../../../components/common/Breadcrumb";
import styles from "../StaticPage.module.css";

export default function PrivacyPolicy() {
  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "Confidentialité" }]} />
      <h1>Politique de confidentialité</h1>

      <h2>Données collectées</h2>
      <p>
        Lors d'une commande, nous collectons uniquement le nom, le téléphone et l'adresse de
        livraison nécessaires à son traitement. Aucune donnée n'est requise pour naviguer sur le
        site.
      </p>

      <h2>Utilisation des données</h2>
      <p>Ces données servent exclusivement au traitement et au suivi de votre commande.</p>

      <h2>Conservation et partage</h2>
      <p>
        Vos données ne sont ni revendues ni partagées avec des tiers, hormis les prestataires de
        paiement (Wave, Orange Money) et de livraison nécessaires au traitement de votre commande.
      </p>

      <h2>Panier</h2>
      <p>
        Le contenu de votre panier est enregistré localement dans votre navigateur (stockage
        local) afin de le conserver d'une visite à l'autre. Il n'est pas transmis à nos serveurs
        tant que la commande n'est pas validée.
      </p>
    </div>
  );
}
