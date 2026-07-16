import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import styles from "./DashboardLayout.module.css";

const NAV_LINKS = [
  { to: "/proprietaire/tableau-de-bord", label: "Tableau de bord" },
  { to: "/proprietaire/produits", label: "Produits" },
  { to: "/proprietaire/categories", label: "Catégories" },
  { to: "/proprietaire/stock", label: "Stock" },
  { to: "/proprietaire/commandes", label: "Commandes" },
  { to: "/proprietaire/statistiques", label: "Statistiques" },
  { to: "/proprietaire/profil", label: "Profil" },
];

export default function OwnerLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={isMenuOpen}
          aria-controls="owner-sidebar"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          Menu
        </button>
        <span className={styles.title}>Espace propriétaire</span>
        <div className={styles.userBox}>
          <span>{user?.full_name}</span>
          <button type="button" className={styles.logoutButton} onClick={logout}>
            Déconnexion
          </button>
        </div>
      </header>

      <div className={styles.body}>
        <nav
          id="owner-sidebar"
          className={[styles.sidebar, isMenuOpen ? styles.sidebarOpen : ""].join(" ")}
          aria-label="Navigation propriétaire"
        >
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
