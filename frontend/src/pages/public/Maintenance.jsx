import { useEffect, useState } from "react";
import backgroundPhoto from "../../assets/lookbook/shoot-02.jpeg";
import logo from "../../assets/images/logo-marque-dark.png";
import styles from "./Maintenance.module.css";

const COUNTDOWN_TARGET = new Date("2026-09-12T00:00:00");

function getTimeLeft() {
  const diff = COUNTDOWN_TARGET.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(value) {
  return String(value).padStart(2, "0");
}

export default function Maintenance() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

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
        <div className={styles.countdown} role="timer" aria-label="Temps restant avant le retour du site">
          <div className={styles.countdownUnit}>
            <span className={styles.countdownValue}>{pad(timeLeft.days)}</span>
            <span className={styles.countdownLabel}>Jours</span>
          </div>
          <span className={styles.countdownSep}>:</span>
          <div className={styles.countdownUnit}>
            <span className={styles.countdownValue}>{pad(timeLeft.hours)}</span>
            <span className={styles.countdownLabel}>Heures</span>
          </div>
          <span className={styles.countdownSep}>:</span>
          <div className={styles.countdownUnit}>
            <span className={styles.countdownValue}>{pad(timeLeft.minutes)}</span>
            <span className={styles.countdownLabel}>Min</span>
          </div>
          <span className={styles.countdownSep}>:</span>
          <div className={styles.countdownUnit}>
            <span className={styles.countdownValue}>{pad(timeLeft.seconds)}</span>
            <span className={styles.countdownLabel}>Sec</span>
          </div>
        </div>

        <p className={styles.footnote}>Merci de votre patience.</p>
      </div>
    </div>
  );
}
