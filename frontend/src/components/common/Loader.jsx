import styles from "./Loader.module.css";

export default function Loader({ label = "Chargement en cours..." }) {
  return (
    <div className={styles.wrapper} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
