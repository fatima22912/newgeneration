import { useFetch } from "../../hooks/useFetch";
import { usePagination } from "../../hooks/usePagination";
import { listActivityLog } from "../../services/api/accountService";
import ActivityLogRow from "../../components/admin/ActivityLogRow";
import Pagination from "../../components/common/Pagination";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import styles from "./OwnerAccountsList.module.css";

export default function ActivityLog() {
  const { page, goToPage } = usePagination();
  const { data: response, isLoading } = useFetch(
    () => listActivityLog({ page, page_size: 20 }),
    [page],
  );

  const entries = response?.data || [];

  return (
    <div>
      <h1>Journal d'activité</h1>

      {isLoading ? (
        <Loader />
      ) : entries.length === 0 ? (
        <EmptyState message="Aucune activité enregistrée." />
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Action</th>
                  <th scope="col">Élément</th>
                  <th scope="col">Auteur</th>
                  <th scope="col">Adresse IP</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <ActivityLogRow key={entry.id} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={response.meta.page}
            totalPages={response.meta.total_pages}
            onPageChange={(p) => goToPage(p, response.meta.total_pages)}
          />
        </>
      )}
    </div>
  );
}
