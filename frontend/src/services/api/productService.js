import { env } from "../../config/env";
import { mockProducts, getMockProduct } from "../../mocks/products";
import { paginate, simulateDelay } from "../../mocks";
import { loadMockState, saveMockState } from "../../mocks/persistence";
import httpClient from "./httpClient";
import { uploadFile } from "./uploadService";
import { findMockCategoryById } from "./categoryService";

let mockStore = loadMockState("products", mockProducts);

function persist() {
  saveMockState("products", mockStore);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function findMockVariant(variantId) {
  for (const product of mockStore) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) return { product, variant };
  }
  return null;
}

export function decrementMockVariantStock(variantId, quantity) {
  const found = findMockVariant(variantId);
  if (!found) return null;
  found.variant.stock_quantity -= quantity;
  persist();
  return found;
}

function applyFilters(items, params) {
  let result = [...items];
  if (!params.include_inactive) {
    result = result.filter((p) => p.is_active);
  }
  if (params.category) {
    result = result.filter((p) => p.category.slug === params.category);
  }
  if (params.size) {
    result = result.filter((p) => p.variants.some((v) => v.size === params.size));
  }
  if (params.color) {
    result = result.filter((p) => p.variants.some((v) => v.color === params.color));
  }
  if (params.min_price) {
    result = result.filter((p) => parseFloat(p.base_price) >= parseFloat(params.min_price));
  }
  if (params.max_price) {
    result = result.filter((p) => parseFloat(p.base_price) <= parseFloat(params.max_price));
  }
  if (params.search) {
    const term = params.search.toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(term));
  }
  if (params.sort === "price_asc") {
    result.sort((a, b) => parseFloat(a.base_price) - parseFloat(b.base_price));
  } else if (params.sort === "price_desc") {
    result.sort((a, b) => parseFloat(b.base_price) - parseFloat(a.base_price));
  } else {
    result.sort((a, b) => b.id - a.id);
  }
  return result;
}

export async function listProducts(params = {}) {
  if (env.useMocks) {
    const filtered = applyFilters(mockStore, params);
    return simulateDelay(paginate(filtered, params.page || 1, params.page_size || 20));
  }
  const { data } = await httpClient.get("/products", { params });
  return data;
}

export async function getProduct(idOrSlug) {
  if (env.useMocks) {
    const product = getMockProduct(idOrSlug, mockStore);
    return simulateDelay({ data: product });
  }
  const { data } = await httpClient.get(`/products/${idOrSlug}`);
  return data;
}

export async function createProduct(payload) {
  if (env.useMocks) {
    // Identifiant de produit unique -> sert aussi de base à des ID de
    // variantes garantis uniques (product.id * 1000 + index), plutôt que
    // Date.now() qui peut entrer en collision entre deux créations rapides.
    const newProductId = Math.max(0, ...mockStore.map((p) => p.id)) + 1;
    const product = {
      ...payload,
      id: newProductId,
      slug: payload.name.toLowerCase().replace(/\s+/g, "-"),
      images: [],
      variants: (payload.variants || []).map((v, i) => ({
        ...v,
        id: newProductId * 1000 + i,
        sku: `MOCK-${newProductId}-${i}`,
      })),
      is_active: payload.is_active ?? true,
      category: findMockCategoryById(payload.category_id),
    };
    mockStore = [product, ...mockStore];
    persist();
    return simulateDelay({ data: product });
  }
  const { data } = await httpClient.post("/products", payload);
  return data;
}

export async function updateProduct(id, payload) {
  if (env.useMocks) {
    const numericId = Number(id);
    mockStore = mockStore.map((p) => {
      if (p.id !== numericId) return p;
      const category = payload.category_id ? findMockCategoryById(payload.category_id) : p.category;
      // Assigne un ID aux variantes ajoutées pendant cette édition (elles
      // n'en ont pas encore) ; garde celui des variantes déjà existantes.
      const variants = payload.variants
        ? payload.variants.map((v, i) => ({ ...v, id: v.id ?? numericId * 1000 + 500 + i }))
        : p.variants;
      return { ...p, ...payload, category, variants };
    });
    persist();
    return simulateDelay({ data: mockStore.find((p) => p.id === numericId) });
  }
  const { data } = await httpClient.put(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id) {
  if (env.useMocks) {
    mockStore = mockStore.filter((p) => p.id !== Number(id));
    persist();
    return simulateDelay(null);
  }
  await httpClient.delete(`/products/${id}`);
}

export async function duplicateProduct(id) {
  if (env.useMocks) {
    const original = mockStore.find((p) => p.id === Number(id));
    const copy = { ...original, id: Date.now(), name: `${original.name} (copie)`, is_active: false };
    mockStore = [copy, ...mockStore];
    persist();
    return simulateDelay({ data: copy });
  }
  const { data } = await httpClient.post(`/products/${id}/duplicate`);
  return data;
}

export function getMockProductsSnapshot() {
  return mockStore;
}

export async function uploadProductImage(id, file) {
  if (env.useMocks) {
    const product = mockStore.find((p) => p.id === Number(id));
    // Convertie en data URL (pas createObjectURL) pour que la photo
    // survive à un rechargement de page : un blob local n'est valide que
    // pour l'onglet qui l'a créé et devient un lien mort après reload.
    const dataUrl = await fileToDataUrl(file);
    const image = {
      id: Date.now(),
      image_url: dataUrl,
      display_order: (product?.images.length || 0) + 1,
    };
    if (product) {
      product.images = [...product.images, image];
      persist();
    }
    return simulateDelay({ data: image });
  }
  return uploadFile(`/products/${id}/images`, file);
}
