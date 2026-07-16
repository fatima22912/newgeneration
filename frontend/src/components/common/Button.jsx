import styles from "./Button.module.css";

const VARIANT_CLASS = {
  primary: styles.primary,
  secondary: styles.secondary,
  danger: styles.danger,
  ghost: styles.ghost,
};

export default function Button({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  fullWidth = false,
  onClick,
  ...rest
}) {
  const className = [styles.button, VARIANT_CLASS[variant], fullWidth ? styles.fullWidth : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={className} disabled={disabled} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}
