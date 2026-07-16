import Breadcrumb from "../../components/common/Breadcrumb";
import { STORE } from "../../utils/constants";
import styles from "./StaticPage.module.css";

export default function About() {
  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "À propos" }]} />
      <h1>À propos de New Generation</h1>

      <p>
        New Generation est une boutique de prêt-à-porter urbain basée à Dakar, spécialisée dans
        les t-shirts, maillots, pantalons, bonnets et pulls.
      </p>
      <p className={styles.placeholderNote}>
        [Texte de présentation de la marque à venir — contenu temporaire en attendant les textes
        définitifs fournis par la boutique.]
      </p>

      <h2>Nos boutiques</h2>
      <ul>
        {STORE.addresses.map((address) => (
          <li key={address}>{address}</li>
        ))}
      </ul>

      <h2>Nous suivre</h2>
      <ul>
        <li>
          <a href={STORE.instagramUrl} target="_blank" rel="noreferrer">
            Instagram — @newgeneration_dkr
          </a>
        </li>
        <li>
          <a href={STORE.tiktokUrl} target="_blank" rel="noreferrer">
            TikTok
          </a>
        </li>
      </ul>
    </div>
  );
}
