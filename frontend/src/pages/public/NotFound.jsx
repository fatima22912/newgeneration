import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import styles from "./StatusPage.module.css";

export default function NotFound() {
  return (
    <div className={`container ${styles.wrapper}`}>
      <h1>Page introuvable</h1>
      <p>La page que vous recherchez n'existe pas ou a été déplacée.</p>
      <Link to="/">
        <Button>Retour à l'accueil</Button>
      </Link>
    </div>
  );
}
