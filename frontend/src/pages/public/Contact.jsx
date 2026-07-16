import { useForm } from "../../hooks/useForm";
import { useToast } from "../../components/common/ToastProvider";
import { sendContactMessage } from "../../services/api/contactService";
import { isRequired, isValidEmail, minLength } from "../../utils/validators";
import TextField from "../../components/common/TextField";
import Button from "../../components/common/Button";
import Breadcrumb from "../../components/common/Breadcrumb";
import { STORE } from "../../utils/constants";
import styles from "./Contact.module.css";

function validate(values) {
  const errors = {};
  if (!isRequired(values.name)) errors.name = "Le nom est requis.";
  if (!isValidEmail(values.email)) errors.email = "Adresse email invalide.";
  if (!isRequired(values.subject)) errors.subject = "L'objet est requis.";
  if (!minLength(values.message, 10)) errors.message = "Message trop court (10 caractères min.).";
  return errors;
}

export default function Contact() {
  const { showToast } = useToast();
  const { values, errors, handleChange, handleSubmit, isSubmitting, setValues } = useForm(
    { name: "", email: "", subject: "", message: "" },
    validate,
  );

  async function submit() {
    try {
      await sendContactMessage(values);
      showToast("Votre message a bien été envoyé.", "success");
      setValues({ name: "", email: "", subject: "", message: "" });
    } catch {
      showToast("Impossible d'envoyer le message pour le moment.", "error");
    }
  }

  return (
    <div className="container">
      <Breadcrumb items={[{ label: "Accueil", to: "/" }, { label: "Contact" }]} />
      <h1>Contact</h1>

      <div className={styles.layout}>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(submit);
          }}
        >
          <TextField label="Nom" required value={values.name} onChange={(v) => handleChange("name", v)} error={errors.name} />
          <TextField
            label="Email"
            type="email"
            required
            value={values.email}
            onChange={(v) => handleChange("email", v)}
            error={errors.email}
          />
          <TextField
            label="Objet"
            required
            value={values.subject}
            onChange={(v) => handleChange("subject", v)}
            error={errors.subject}
          />
          <div className={styles.field}>
            <label htmlFor="message" className={styles.label}>
              Message *
            </label>
            <textarea
              id="message"
              className={styles.textarea}
              rows={6}
              required
              value={values.message}
              onChange={(e) => handleChange("message", e.target.value)}
              aria-invalid={Boolean(errors.message)}
            />
            {errors.message && (
              <p role="alert" className={styles.error}>
                {errors.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Envoi..." : "Envoyer le message"}
          </Button>
        </form>

        <aside className={styles.info}>
          <h2>Nos coordonnées</h2>
          <ul>
            {STORE.phones.map((phone) => (
              <li key={phone}>{phone}</li>
            ))}
          </ul>
          <ul>
            {STORE.addresses.map((address) => (
              <li key={address}>{address}</li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
