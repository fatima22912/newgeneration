import { ORDER_STATUS_LABELS } from "../../utils/constants";
import Button from "../common/Button";
import styles from "./OrderStatusStepper.module.css";

const ALLOWED_TRANSITIONS = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export default function OrderStatusStepper({ status, onChangeStatus, isUpdating }) {
  const nextOptions = ALLOWED_TRANSITIONS[status] || [];

  return (
    <div className={styles.wrapper}>
      <p className={styles.current}>
        Statut actuel : <strong>{ORDER_STATUS_LABELS[status]}</strong>
      </p>
      {nextOptions.length > 0 && (
        <div className={styles.actions}>
          {nextOptions.map((next) => (
            <Button
              key={next}
              variant={next === "cancelled" ? "danger" : "primary"}
              onClick={() => onChangeStatus(next)}
              disabled={isUpdating}
            >
              Passer à « {ORDER_STATUS_LABELS[next]} »
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
