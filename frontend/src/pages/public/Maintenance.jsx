import backgroundPhoto from "../../assets/lookbook/shoot-07.jpeg";
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
        <h1 className={styles.title}>On revient très vite</h1>
        <p className={styles.subtitle}>
          New Generation fait peau neuve. Notre boutique est momentanément en pause le
          temps de quelques réglages — repassez très bientôt pour découvrir la suite.
        </p>
        <p className={styles.footnote}>Merci de votre patience.</p>
      </div>
    </div>
  );
}
