import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { useToast } from "../../components/common/ToastProvider";
import { listCategories } from "../../services/api/categoryService";
import {
  createProduct,
  getProduct,
  updateProduct,
  uploadProductImage,
} from "../../services/api/productService";
import TextField from "../../components/common/TextField";
import SelectField from "../../components/common/SelectField";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ProductVariantEditor from "../../components/owner/ProductVariantEditor";
import ImageUploader from "../../components/owner/ImageUploader";
import styles from "./ProductForm.module.css";

const EMPTY_PRODUCT = {
  category_id: "",
  name: "",
  description: "",
  base_price: "",
  is_active: true,
  variants: [{ size: "", color: "", stock_quantity: 0 }],
};

export default function ProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { data: categoriesResponse } = useFetch(() => listCategories(), []);
  const { data: productResponse, isLoading } = useFetch(
    () => (isEditing ? getProduct(id) : Promise.resolve(null)),
    [id],
  );

  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [images, setImages] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (productResponse?.data) {
      const p = productResponse.data;
      setForm({
        category_id: p.category.id,
        name: p.name,
        description: p.description || "",
        base_price: p.base_price,
        is_active: p.is_active,
        variants: p.variants,
      });
      setImages(p.images || []);
    }
  }, [productResponse]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = { ...form, category_id: Number(form.category_id), base_price: form.base_price };
      if (isEditing) {
        await updateProduct(id, payload);
        showToast("Produit mis à jour.", "success");
      } else {
        const response = await createProduct(payload);
        showToast("Produit créé.", "success");
        navigate(`/proprietaire/produits/${response.data.id}`);
        return;
      }
      navigate("/proprietaire/produits");
    } catch {
      showToast("Une erreur est survenue lors de l'enregistrement.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUploadImage(file) {
    setIsUploading(true);
    try {
      const response = await uploadProductImage(id, file);
      setImages((current) => [...current, response.data]);
    } catch {
      showToast("Échec de l'envoi de l'image.", "error");
    } finally {
      setIsUploading(false);
    }
  }

  if (isEditing && isLoading) return <Loader />;

  const categories = categoriesResponse?.data || [];
  const hasNoCategories = categoriesResponse && categories.length === 0;

  if (hasNoCategories) {
    return (
      <div>
        <h1>{isEditing ? "Modifier le produit" : "Nouveau produit"}</h1>
        <EmptyState
          message="Aucune catégorie n'existe encore. Un produit doit appartenir à une catégorie : créez-en une d'abord."
          action={
            <Link to="/proprietaire/categories">
              <Button>Créer une catégorie</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <h1>{isEditing ? "Modifier le produit" : "Nouveau produit"}</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <TextField label="Nom du produit" required value={form.name} onChange={(v) => updateField("name", v)} />

        <div className={styles.field}>
          <label htmlFor="description" className={styles.label}>
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className={styles.textarea}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>

        <SelectField
          label="Catégorie"
          required
          value={form.category_id}
          onChange={(v) => updateField("category_id", v)}
          options={[
            { value: "", label: "Choisir une catégorie" },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />

        <TextField
          label="Prix de base (FCFA)"
          type="number"
          min="0"
          required
          value={form.base_price}
          onChange={(v) => updateField("base_price", v)}
        />

        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => updateField("is_active", e.target.checked)}
          />
          Produit visible sur le site
        </label>

        <ProductVariantEditor variants={form.variants} onChange={(v) => updateField("variants", v)} />

        {isEditing && (
          <ImageUploader images={images} onUpload={handleUploadImage} isUploading={isUploading} />
        )}

        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={() => navigate("/proprietaire/produits")}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}
