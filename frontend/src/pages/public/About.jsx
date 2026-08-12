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
      <p>
        NEW GENERATION est une marque streetwear créée par deux amis, pensée pour une nouvelle
        génération qui ose être différente. Nous mélangeons style, culture urbaine et identité
        pour créer des pièces qui racontent une histoire.
      </p>
      <p className={styles.tagline}>NEW GENERATION. STORYCHANGERS.</p>

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
