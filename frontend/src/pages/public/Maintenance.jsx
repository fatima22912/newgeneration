import backgroundPhoto from "../../assets/lookbook/shoot-02.jpeg";
import logo from "../../assets/images/logo-marque-dark.png";
import styles from "./Maintenance.module.css";

export default function Maintenance() {
  return (
    <div className={styles.wrapper}>
      <div
        className={styles.background}
        style={{ "--maintenance-bg-image": `url(${backgroundPhoto})` }}
      />
      <div className={styles.overlay} />

      <div className={styles.content}>
        <div className={styles.logoRing}>
          <div className={styles.logoGlow} />
          <img src={logo} alt="New Generation" className={styles.logoSpin} />
        </div>

        <span className={styles.eyebrow}>Maintenance en cours</span>
        <h1 className={styles.title}>On revient en force</h1>
        <p className={styles.subtitle}>
          New Generation prépare son grand retour avec une toute nouvelle collection.
          Notre boutique est en pause le temps des derniers réglages — restez connectés,
          ça arrive très vite.
        </p>
        <p className={styles.footnote}>Merci de votre patience.</p>
      </div>
    </div>
  );
}
