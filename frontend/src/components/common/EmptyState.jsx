import styles from "./EmptyState.module.css";

export default function EmptyState({ message, action }) {
  return (
    <div className={styles.wrapper}>
      <p>{message}</p>
      {action}
    </div>
  );
}
