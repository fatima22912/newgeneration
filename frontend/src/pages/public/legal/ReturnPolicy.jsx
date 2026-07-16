import Breadcrumb from "../../../components/common/Breadcrumb";
import { STORE } from "../../../utils/constants";
import styles from "../StaticPage.module.css";

export default function ReturnPolicy() {
  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "Retours et échanges" }]} />
      <h1>Retours et échanges</h1>

      <p className={styles.placeholderNote}>
        [Contenu temporaire — la politique de retours et échanges définitive sera fournie
        séparément par la boutique.]
      </p>

      <h2>Comment procéder</h2>
      <p>
        Pour toute demande de retour ou d'échange, contactez-nous au {STORE.phones.join(" ou ")}
        {" "}
        ou rendez-vous directement dans l'une de nos boutiques ({STORE.addresses.join(" · ")}).
      </p>
    </div>
  );
}
