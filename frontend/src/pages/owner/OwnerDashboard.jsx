import { useFetch } from "../../hooks/useFetch";
import { getOwnerStats } from "../../services/api/statsService";
import KpiCard from "../../components/owner/KpiCard";
import StockAlertBanner from "../../components/owner/StockAlertBanner";
import Loader from "../../components/common/Loader";
import { formatPrice } from "../../utils/formatters";
import styles from "./OwnerDashboard.module.css";

export default function OwnerDashboard() {
  const { data: response, isLoading } = useFetch(() => getOwnerStats(), []);
  const stats = response?.data;

  if (isLoading) return <Loader />;

  return (
    <div>
      <h1>Tableau de bord</h1>

      <StockAlertBanner variants={stats.low_stock_variants} />

      <div className={styles.kpiGrid}>
        <KpiCard label="Commandes en attente" value={stats.pending_orders_count} tone={stats.pending_orders_count > 0 ? "warning" : "default"} />
        <KpiCard label="Chiffre d'affaires aujourd'hui" value={formatPrice(stats.revenue_today)} />
        <KpiCard label="Chiffre d'affaires cette semaine" value={formatPrice(stats.revenue_week)} />
        <KpiCard label="Chiffre d'affaires ce mois" value={formatPrice(stats.revenue_month)} />
      </div>

      <section className={styles.section}>
        <h2>Produits les plus vendus</h2>
        <ol className={styles.topList}>
          {stats.top_products.map((p) => (
            <li key={p.product_id}>
              {p.product_name} — {p.quantity_sold} vendus ({formatPrice(p.revenue)})
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
