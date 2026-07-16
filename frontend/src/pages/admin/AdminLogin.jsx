import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import TextField from "../../components/common/TextField";
import Button from "../../components/common/Button";
import styles from "../LoginPage.module.css";

export default function AdminLogin() {
  const { loginAsAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await loginAsAdmin(email, password);
      navigate("/admin/tableau-de-bord");
    } catch (err) {
      const code = err.response?.data?.error?.code;
      if (code === "account_locked") {
        setError("Compte temporairement verrouillé suite à trop de tentatives échouées.");
      } else {
        setError("Email ou mot de passe incorrect.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1>Espace administrateur</h1>
        <p className={styles.subtitle}>Accès technique réservé.</p>

        <TextField label="Email" type="email" required value={email} onChange={setEmail} />
        <TextField label="Mot de passe" type="password" required value={password} onChange={setPassword} />

        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </div>
  );
}
