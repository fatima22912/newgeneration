import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { getProduct, listProducts } from "../../services/api/productService";
import { useCart } from "../../hooks/useCart";
import { useToast } from "../../components/common/ToastProvider";
import ProductGallery from "../../components/public/ProductGallery";
import ProductVariantSelector from "../../components/public/ProductVariantSelector";
import ProductCard from "../../components/public/ProductCard";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import Breadcrumb from "../../components/common/Breadcrumb";
import { formatPrice } from "../../utils/formatters";
import styles from "./ProductDetail.module.css";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [selection, setSelection] = useState({ variant: null, quantity: 1 });

  const { data: response, isLoading, error } = useFetch(() => getProduct(slug), [slug]);
  const product = response?.data;

  const { data: similarResponse } = useFetch(
    () => (product ? listProducts({ category: product.category.slug, page_size: 4 }) : Promise.resolve(null)),
    [product?.id],
  );

  if (isLoading) return <Loader />;
  if (error || !product) {
    return (
      <div className="container">
        <p>Ce produit n'existe pas ou n'est plus disponible.</p>
        <Button onClick={() => navigate("/catalogue")}>Retour au catalogue</Button>
      </div>
    );
  }

  function handleAddToCart() {
    if (!selection.variant) return;
    addItem({
      product_variant_id: selection.variant.id,
      product_id: product.id,
      product_name: product.name,
      slug: product.slug,
      size: selection.variant.size,
      color: selection.variant.color,
      unit_price: product.base_price,
      quantity: selection.quantity,
      max_stock: selection.variant.stock_quantity,
      image_url: product.images?.[0]?.image_url || null,
    });
    showToast(`${product.name} ajouté au panier.`, "success");
  }

  const similarProducts = (similarResponse?.data || []).filter((p) => p.id !== product.id);

  return (
    <div className="container">
      <Breadcrumb
        items={[
          { label: "Accueil", to: "/" },
          { label: "Catalogue", to: "/catalogue" },
          { label: product.name },
        ]}
      />

      <div className={styles.layout}>
        <ProductGallery images={product.images} productName={product.name} />

        <div className={styles.info}>
          <span className={styles.category}>{product.category.name}</span>
          <h1>{product.name}</h1>
          <p className={styles.price}>{formatPrice(product.base_price)}</p>
          <p className={styles.description}>{product.description}</p>

          <ProductVariantSelector variants={product.variants} onChange={setSelection} />

          <Button
            fullWidth
            disabled={!selection.variant || selection.variant.stock_quantity === 0}
            onClick={handleAddToCart}
          >
            Ajouter au panier
          </Button>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <section className={styles.similar}>
          <h2>Produits similaires</h2>
          <div className={styles.similarGrid}>
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
