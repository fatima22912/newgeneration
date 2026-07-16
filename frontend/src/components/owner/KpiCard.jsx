import styles from "./KpiCard.module.css";

export default function KpiCard({ label, value, tone = "default" }) {
  return (
    <div className={[styles.card, tone === "warning" ? styles.warning : ""].join(" ")}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}
