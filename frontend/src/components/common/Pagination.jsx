import styles from "./Pagination.module.css";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        type="button"
        className={styles.navButton}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Précédent
      </button>
      <span className={styles.status} aria-live="polite">
        Page {page} sur {totalPages}
      </span>
      <button
        type="button"
        className={styles.navButton}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Suivant
      </button>
    </nav>
  );
}
