import { useFetch } from "../../hooks/useFetch";
import { getOwnerStats } from "../../services/api/statsService";
import KpiCard from "../../components/owner/KpiCard";
import DataTable from "../../components/common/DataTable";
import Loader from "../../components/common/Loader";
import { formatPrice } from "../../utils/formatters";
import styles from "./OwnerDashboard.module.css";

export default function OwnerStatistics() {
  const { data: response, isLoading } = useFetch(() => getOwnerStats(), []);
  if (isLoading) return <Loader />;
  const stats = response.data;

  const columns = [
    { key: "product_name", header: "Produit" },
    { key: "quantity_sold", header: "Quantité vendue" },
    { key: "revenue", header: "Chiffre d'affaires", render: (p) => formatPrice(p.revenue) },
  ];

  return (
    <div>
      <h1>Statistiques</h1>

      <div className={styles.kpiGrid}>
        <KpiCard label="Aujourd'hui" value={formatPrice(stats.revenue_today)} />
        <KpiCard label="Cette semaine" value={formatPrice(stats.revenue_week)} />
        <KpiCard label="Ce mois" value={formatPrice(stats.revenue_month)} />
      </div>

      <section className={styles.section}>
        <h2>Ventes par produit</h2>
        <DataTable columns={columns} data={stats.top_products} rowKey={(p) => p.product_id} />
      </section>
    </div>
  );
}
