import { Component } from "react";
import styles from "./ErrorBoundary.module.css";
import Button from "./Button";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error("Erreur interceptée par ErrorBoundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.wrapper} role="alert">
          <h2>Une erreur est survenue</h2>
          <p>Veuillez recharger la page. Si le problème persiste, contactez-nous.</p>
          <Button onClick={() => window.location.reload()}>Recharger la page</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
