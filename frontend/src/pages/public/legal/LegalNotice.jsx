import Breadcrumb from "../../../components/common/Breadcrumb";
import { STORE } from "../../../utils/constants";
import styles from "../StaticPage.module.css";

export default function LegalNotice() {
  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "Mentions légales" }]} />
      <h1>Mentions légales</h1>

      <h2>Éditeur du site</h2>
      <p>
        New Generation, exploité en nom propre par Fatou Mbaye — boutiques :{" "}
        {STORE.addresses.join(" · ")}.
      </p>
      <p>Contact : {STORE.phones.join(" · ")}</p>
    </div>
  );
}
