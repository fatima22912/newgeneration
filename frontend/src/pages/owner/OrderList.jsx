import { Link } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { usePagination } from "../../hooks/usePagination";
import { listOrders } from "../../services/api/orderService";
import DataTable from "../../components/common/DataTable";
import Pagination from "../../components/common/Pagination";
import SelectField from "../../components/common/SelectField";
import Loader from "../../components/common/Loader";
import { formatDateTime, formatPrice } from "../../utils/formatters";
import { ORDER_STATUS_LABELS } from "../../utils/constants";
import { useState } from "react";
import styles from "./OrderList.module.css";

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  ...Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

export default function OrderList() {
  const { page, goToPage } = usePagination();
  const [status, setStatus] = useState("");

  const { data: response, isLoading } = useFetch(
    () => listOrders({ status: status || undefined, page, page_size: 10 }),
    [status, page],
  );

  const columns = [
    { key: "order_number", header: "N° commande", render: (o) => <Link to={`/proprietaire/commandes/${o.id}`}>{o.order_number}</Link> },
    { key: "customer_name", header: "Client" },
    { key: "status", header: "Statut", render: (o) => ORDER_STATUS_LABELS[o.status] },
    { key: "total_amount", header: "Total", render: (o) => formatPrice(o.total_amount) },
    { key: "created_at", header: "Date", render: (o) => formatDateTime(o.created_at) },
  ];

  return (
    <div>
      <h1>Commandes</h1>

      <div className={styles.filters}>
        <SelectField label="Filtrer par statut" value={status} onChange={setStatus} options={STATUS_OPTIONS} />
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <>
          <DataTable columns={columns} data={response?.data || []} rowKey={(o) => o.id} emptyMessage="Aucune commande." />
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
