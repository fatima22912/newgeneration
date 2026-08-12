import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className={styles.page}>
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>

      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link to="/" className={styles.brand} aria-label="New Generation, accueil">
            <img src={logoMarque} alt="New Generation" className={styles.logo} />
          </Link>

          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={isMenuOpen}
            aria-controls="main-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            Menu
          </button>

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

          <Link to="/panier" className={styles.cartLink}>
            Panier
            <span className={styles.cartCount} aria-live="polite">
              {totalQuantity}
            </span>
          </Link>
        </div>
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
