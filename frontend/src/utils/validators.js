export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

export function isRequired(value) {
  return typeof value === "string" ? value.trim().length > 0 : value !== null && value !== undefined;
}

export function minLength(value, length) {
  return (value || "").trim().length >= length;
}
