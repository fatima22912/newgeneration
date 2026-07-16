import TextField from "../common/TextField";
import Button from "../common/Button";
import styles from "./ProductVariantEditor.module.css";

const EMPTY_VARIANT = { size: "", color: "", stock_quantity: 0 };

export default function ProductVariantEditor({ variants, onChange }) {
  function updateVariant(index, field, value) {
    const next = variants.map((v, i) => (i === index ? { ...v, [field]: value } : v));
    onChange(next);
  }

  function addVariant() {
    onChange([...variants, { ...EMPTY_VARIANT }]);
  }

  function removeVariant(index) {
    onChange(variants.filter((_, i) => i !== index));
  }

  return (
    <div className={styles.editor}>
      <h3 className={styles.title}>Variantes (taille / couleur / stock)</h3>

      {variants.map((variant, index) => (
        <div key={index} className={styles.row}>
          <TextField
            label="Taille"
            value={variant.size}
            onChange={(v) => updateVariant(index, "size", v)}
          />
          <TextField
            label="Couleur"
            value={variant.color}
            onChange={(v) => updateVariant(index, "color", v)}
          />
          <TextField
            label="Stock"
            type="number"
            min="0"
            value={variant.stock_quantity}
            onChange={(v) => updateVariant(index, "stock_quantity", Number(v))}
          />
          <Button variant="danger" onClick={() => removeVariant(index)}>
            Retirer
          </Button>
        </div>
      ))}

      <Button variant="secondary" onClick={addVariant}>
        Ajouter une variante
      </Button>
    </div>
  );
}
