import Breadcrumb from "../../../components/common/Breadcrumb";
import { STORE } from "../../../utils/constants";
import styles from "../StaticPage.module.css";

export default function LegalNotice() {
  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "Mentions légales" }]} />
      <h1>Mentions légales</h1>

      <p className={styles.placeholderNote}>
        [Contenu temporaire — les mentions légales définitives (raison sociale, numéro
        d'immatriculation, forme juridique) seront fournies séparément par la boutique.]
      </p>

      <h2>Éditeur du site</h2>
      <p>New Generation — boutiques : {STORE.addresses.join(" · ")}.</p>
      <p>Contact : {STORE.phones.join(" · ")}</p>

      <h2>Hébergement</h2>
      <p className={styles.placeholderNote}>[Informations d'hébergement à venir.]</p>
    </div>
  );
}
