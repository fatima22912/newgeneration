import Breadcrumb from "../../components/common/Breadcrumb";
import logoMarqueDark from "../../assets/images/logo-marque-dark.png";
import { STORE } from "../../utils/constants";
import styles from "./StaticPage.module.css";

export default function About() {
  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "À propos" }]} />
      <h1>À propos de New Generation</h1>

      <div className={styles.introText}>
        <p>
          New Generation est une boutique de prêt-à-porter urbain basée à Dakar, spécialisée
          dans les t-shirts, maillots, pantalons, bonnets et pulls.
        </p>
        <p>
          NEW GENERATION est une marque streetwear créée par deux amis, pensée pour une
          nouvelle génération qui ose être différente. Nous mélangeons style, culture urbaine
          et identité pour créer des pièces qui racontent une histoire.
        </p>
      </div>
      <p className={styles.tagline}>NEW GENERATION. STORYCHANGERS.</p>

      <div className={styles.brandPanel}>
        <img src={logoMarqueDark} alt="New Generation" className={styles.brandLogo} />

        <div className={styles.brandInfo}>
          <div>
            <h2>Nos boutiques</h2>
            <ul>
              {STORE.addresses.map((address) => (
                <li key={address}>{address}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2>Nous suivre</h2>
            <ul className={styles.socialList}>
              <li>
                <a
                  href={STORE.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.socialLink}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    aria-hidden="true"
                    className={styles.socialIcon}
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="5"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                    <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="2" fill="none" />
                    <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
                  </svg>
                  <span>
                    Instagram — <span className={styles.socialUrl}>{STORE.instagramUrl}</span>
                  </span>
                </a>
              </li>
              <li>
                <a href={STORE.tiktokUrl} target="_blank" rel="noreferrer" className={styles.socialLink}>
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
                    aria-hidden="true"
                    className={styles.socialIcon}
                  >
                    <path
                      d="M16.5 3c.4 2.2 1.8 3.6 4 3.9v3.1c-1.4 0-2.8-.4-4-1.2v6.4a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v3.2a2.4 2.4 0 1 0 1.7 2.3V3h3Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>
                    TikTok — <span className={styles.socialUrl}>{STORE.tiktokUrl}</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
