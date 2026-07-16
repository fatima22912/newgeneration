import styles from "./StatChart.module.css";

export default function StatChart({ title, data, valueFormatter = (v) => v }) {
  const maxValue = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className={styles.wrapper}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <ul className={styles.bars}>
        {data.map((item) => (
          <li key={item.label} className={styles.row}>
            <span className={styles.label}>{item.label}</span>
            <span className={styles.track}>
              <span
                className={styles.fill}
                style={{ width: `${Math.max(4, (item.value / maxValue) * 100)}%` }}
              />
            </span>
            <span className={styles.value}>{valueFormatter(item.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
