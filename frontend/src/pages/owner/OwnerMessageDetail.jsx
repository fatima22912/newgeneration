import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { getContactMessage, markContactMessageRead } from "../../services/api/contactService";
import Loader from "../../components/common/Loader";
import Breadcrumb from "../../components/common/Breadcrumb";
import { formatDateTime } from "../../utils/formatters";
import styles from "./OwnerMessageDetail.module.css";

export default function OwnerMessageDetail() {
  const { id } = useParams();
  const { data: response, isLoading } = useFetch(() => getContactMessage(id), [id]);
  const message = response?.data;

  useEffect(() => {
    if (message && !message.is_read) {
      markContactMessageRead(id);
    }
  }, [id, message]);

  if (isLoading) return <Loader />;
  if (!message) return <p>Message introuvable.</p>;

  return (
    <div>
      <Breadcrumb items={[{ label: "Messages", to: "/proprietaire/messages" }, { label: message.subject }]} />
      <h1>{message.subject}</h1>

      <section className={styles.card}>
        <p>
          <strong>{message.name}</strong> — <a href={`mailto:${message.email}`}>{message.email}</a>
        </p>
        <p>Reçu le {formatDateTime(message.created_at)}</p>
        <p className={styles.message}>{message.message}</p>
      </section>
    </div>
  );
}
