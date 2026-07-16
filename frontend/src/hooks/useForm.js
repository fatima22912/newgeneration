import { useState } from "react";

// validate: (values) => { field: "message" } — retourne un objet d'erreurs vide si valide.
export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(onValid) {
    const nextErrors = validate ? validate(values) : {};
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      await onValid(values);
    } finally {
      setIsSubmitting(false);
    }
  }

  return { values, setValues, errors, setErrors, handleChange, handleSubmit, isSubmitting };
}
