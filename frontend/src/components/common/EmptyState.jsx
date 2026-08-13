import styles from "./EmptyState.module.css";

export default function EmptyState({ message, action, icon }) {
  return (
    <div className={styles.wrapper}>
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <p>{message}</p>
      {action}
    </div>
  );
}
