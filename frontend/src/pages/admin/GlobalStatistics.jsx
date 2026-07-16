import { useFetch } from "../../hooks/useFetch";
import { getGlobalStats } from "../../services/api/statsService";
import KpiCard from "../../components/owner/KpiCard";
import StatChart from "../../components/admin/StatChart";
import Loader from "../../components/common/Loader";
import { formatPrice } from "../../utils/formatters";
import styles from "../owner/OwnerDashboard.module.css";

export default function GlobalStatistics() {
  const { data: response, isLoading } = useFetch(() => getGlobalStats(), []);
  if (isLoading) return <Loader />;
  const stats = response.data;

  return (
    <div>
      <h1>Statistiques globales</h1>

      <div className={styles.kpiGrid}>
        <KpiCard label="Chiffre d'affaires total" value={formatPrice(stats.total_revenue)} />
        <KpiCard label="Nombre de commandes" value={stats.orders_count} />
        <KpiCard label="Comptes propriétaires" value={stats.owners_count} />
      </div>

      <section className={styles.section}>
        <StatChart
          title="Chiffre d'affaires par produit"
          data={stats.top_products.map((p) => ({ label: p.product_name, value: parseFloat(p.revenue) }))}
          valueFormatter={formatPrice}
        />
      </section>
    </div>
  );
}
