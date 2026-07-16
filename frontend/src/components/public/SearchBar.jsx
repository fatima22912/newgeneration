import { useState } from "react";
import styles from "./SearchBar.module.css";

export default function SearchBar({ initialValue = "", onSearch }) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(e) {
    e.preventDefault();
    onSearch(value.trim());
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} role="search">
      <label htmlFor="catalogue-search" className="visually-hidden">
        Rechercher un produit
      </label>
      <input
        id="catalogue-search"
        type="search"
        className={styles.input}
        placeholder="Rechercher un t-shirt, un bonnet..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit" className={styles.submit}>
        Rechercher
      </button>
    </form>
  );
}
