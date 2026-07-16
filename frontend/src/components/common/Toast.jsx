import styles from "./Toast.module.css";

const VARIANT_CLASS = {
  success: styles.success,
  error: styles.error,
  warning: styles.warning,
};

export default function Toast({ message, variant = "success" }) {
  return (
    <div className={[styles.toast, VARIANT_CLASS[variant]].join(" ")} role="status">
      {message}
    </div>
  );
}
