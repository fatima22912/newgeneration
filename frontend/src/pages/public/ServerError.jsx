import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import styles from "./StatusPage.module.css";

export default function ServerError() {
  return (
    <div className={`container ${styles.wrapper}`}>
      <h1>Une erreur est survenue</h1>
      <p>Le service est momentanément indisponible. Merci de réessayer dans quelques instants.</p>
      <Link to="/">
        <Button>Retour à l'accueil</Button>
      </Link>
    </div>
  );
}
