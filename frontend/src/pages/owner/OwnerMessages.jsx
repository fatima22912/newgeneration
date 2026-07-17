import { Link } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { usePagination } from "../../hooks/usePagination";
import { listContactMessages } from "../../services/api/contactService";
import DataTable from "../../components/common/DataTable";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import { formatDateTime } from "../../utils/formatters";
import styles from "./OwnerMessages.module.css";

export default function OwnerMessages() {
  const { page, goToPage } = usePagination();

  const { data: response, isLoading } = useFetch(
    () => listContactMessages({ page, page_size: 10 }),
    [page],
  );

  const columns = [
    {
      key: "subject",
      header: "Objet",
      render: (m) => (
        <Link to={`/proprietaire/messages/${m.id}`} className={m.is_read ? undefined : styles.unreadLink}>
          {m.subject}
        </Link>
      ),
    },
    { key: "name", header: "Expéditeur" },
    { key: "email", header: "Email" },
    { key: "created_at", header: "Reçu le", render: (m) => formatDateTime(m.created_at) },
    { key: "is_read", header: "Statut", render: (m) => (m.is_read ? "Lu" : "Non lu") },
  ];

  return (
    <div>
      <h1>Messages de contact</h1>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <DataTable columns={columns} data={response?.data || []} rowKey={(m) => m.id} emptyMessage="Aucun message." />
          <Pagination
            page={response?.meta.page || 1}
            totalPages={response?.meta.total_pages || 1}
            onPageChange={(p) => goToPage(p, response?.meta.total_pages)}
          />
        </>
      )}
    </div>
  );
}
