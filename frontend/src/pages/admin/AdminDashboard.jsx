import { useFetch } from "../../hooks/useFetch";
import { getGlobalStats } from "../../services/api/statsService";
import KpiCard from "../../components/owner/KpiCard";
import StatChart from "../../components/admin/StatChart";
import Loader from "../../components/common/Loader";
import { formatPrice } from "../../utils/formatters";
import styles from "../owner/OwnerDashboard.module.css";

export default function AdminDashboard() {
  const { data: response, isLoading } = useFetch(() => getGlobalStats(), []);
  if (isLoading) return <Loader />;
  const stats = response.data;

  return (
    <div>
      <h1>Tableau de bord global</h1>

      <div className={styles.kpiGrid}>
        <KpiCard label="Chiffre d'affaires total" value={formatPrice(stats.total_revenue)} />
        <KpiCard label="Commandes" value={stats.orders_count} />
        <KpiCard label="Comptes propriétaires" value={stats.owners_count} />
        <KpiCard
          label="Connexions échouées (24h)"
          value={stats.recent_failed_logins}
          tone={stats.recent_failed_logins > 0 ? "warning" : "default"}
        />
      </div>

      <section className={styles.section}>
        <StatChart
          title="Produits les plus vendus"
          data={stats.top_products.map((p) => ({ label: p.product_name, value: p.quantity_sold }))}
        />
      </section>
    </div>
  );
}
