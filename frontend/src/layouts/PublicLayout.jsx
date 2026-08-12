import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import logoMarque from "../assets/images/logo-marque.jpeg";
import { useCart } from "../hooks/useCart";
import { STORE } from "../utils/constants";
import styles from "./PublicLayout.module.css";

const NAV_LINKS = [
  { to: "/", label: "Accueil", end: true },
  { to: "/catalogue", label: "Catalogue" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
];

export default function PublicLayout() {
  const { totalQuantity } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  function handleSearchSubmit(e) {
    e.preventDefault();
    const query = searchValue.trim();
    setIsSearchOpen(false);
    setSearchValue("");
    navigate(query ? `/catalogue?search=${encodeURIComponent(query)}` : "/catalogue");
  }

  return (
    <div className={styles.page}>
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>

      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={isMenuOpen}
            aria-controls="main-navigation"
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              {isMenuOpen ? (
                <path
                  d="M5 5 L19 19 M19 5 L5 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              ) : (
                <path
                  d="M4 6 H20 M4 12 H20 M4 18 H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </svg>
          </button>

          <Link to="/" className={styles.brand} aria-label="New Generation, accueil">
            <img src={logoMarque} alt="New Generation" className={styles.logo} />
          </Link>

          <nav
            id="main-navigation"
            className={[styles.nav, isMenuOpen ? styles.navOpen : ""].join(" ")}
            aria-label="Navigation principale"
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => (isActive ? styles.navLinkActive : styles.navLink)}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.iconButton}
              aria-expanded={isSearchOpen}
              aria-controls="header-search-row"
              aria-label={isSearchOpen ? "Fermer la recherche" : "Rechercher"}
              onClick={() => setIsSearchOpen((open) => !open)}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
                <line
                  x1="16.65"
                  y1="16.65"
                  x2="21"
                  y2="21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <Link to="/panier" className={styles.cartLink} aria-label={`Panier, ${totalQuantity} article(s)`}>
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                <path
                  d="M6 8h12l-1 12.1a1 1 0 0 1-1 0.9H8a1 1 0 0 1-1-0.9L6 8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
              <span className={styles.cartCount} aria-hidden="true">
                {totalQuantity}
              </span>
            </Link>
          </div>
        </div>

        {isSearchOpen && (
          <div className={`container ${styles.searchRow}`} id="header-search-row">
            <form className={styles.searchForm} role="search" onSubmit={handleSearchSubmit}>
              <label htmlFor="header-search" className="visually-hidden">
                Rechercher un produit
              </label>
              <input
                id="header-search"
                type="search"
                autoFocus
                className={styles.searchInput}
                placeholder="Rechercher un t-shirt, un bonnet..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <button type="submit" className={styles.searchSubmit} aria-label="Lancer la recherche">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
                  <line
                    x1="16.65"
                    y1="16.65"
                    x2="21"
                    y2="21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </form>
          </div>
        )}
      </header>

      <main id="main-content" className={styles.main}>
        <Outlet />
      </main>

      <div className={styles.footerCurve} aria-hidden="true">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,32 C240,60 480,0 720,14 C960,28 1200,58 1440,30 L1440,60 L0,60 Z" />
        </svg>
      </div>
      <footer className={styles.footer}>
        <div className={`container ${styles.footerInner}`}>
          <div className={styles.footerColumn}>
            <h2 className={styles.footerTitle}>New Generation</h2>
            <p>Prêt-à-porter urbain — t-shirts, maillots, pantalons, bonnets, pulls.</p>
          </div>

          <div className={styles.footerColumn}>
            <h3 className={styles.footerHeading}>Nos boutiques</h3>
            <ul>
              {STORE.addresses.map((address) => (
                <li key={address}>{address}</li>
              ))}
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h3 className={styles.footerHeading}>Nous contacter</h3>
            <ul>
              {STORE.phones.map((phone) => (
                <li key={phone}>
                  <a href={`tel:+221${phone.replace(/\s+/g, "")}`}>{phone}</a>
                </li>
              ))}
            </ul>
            <ul className={styles.socialList}>
              <li>
                <a href={STORE.instagramUrl} target="_blank" rel="noreferrer">
                  Instagram
                </a>
              </li>
              <li>
                <a href={STORE.tiktokUrl} target="_blank" rel="noreferrer">
                  TikTok
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.footerColumn}>
            <h3 className={styles.footerHeading}>Informations</h3>
            <ul>
              <li>
                <Link to="/mentions-legales">Mentions légales</Link>
              </li>
              <li>
                <Link to="/cgv">Conditions générales de vente</Link>
              </li>
              <li>
                <Link to="/confidentialite">Confidentialité</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerCredit}>
          <p>
            Vous voulez un site ou une application ? Fatima Mbaye —{" "}
            <a href="tel:+221768328120">76 832 81 20</a> ·{" "}
            <a href="mailto:fatoumbaye1@esp.sn">fatoumbaye1@esp.sn</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
