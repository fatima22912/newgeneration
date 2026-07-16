import { env } from "../../config/env";
import { mockOrders } from "../../mocks/orders";
import { paginate, simulateDelay } from "../../mocks";
import { loadMockState, saveMockState } from "../../mocks/persistence";
import httpClient from "./httpClient";
import { decrementMockVariantStock, findMockVariant } from "./productService";

let mockStore = loadMockState("orders", mockOrders);
let mockOrderSeq = loadMockState("order_seq", mockStore.length + 1);

function persist() {
  saveMockState("orders", mockStore);
  saveMockState("order_seq", mockOrderSeq);
}

function mockOrderError(status, code, message) {
  const error = new Error(message);
  error.response = { status, data: { error: { code, message } } };
  return error;
}

export async function createOrder(payload) {
  if (env.useMocks) {
    for (const item of payload.items) {
      const found = findMockVariant(item.product_variant_id);
      if (!found) {
        throw mockOrderError(404, "not_found", "Variante produit introuvable.");
      }
      if (found.variant.stock_quantity < item.quantity) {
        throw mockOrderError(
          409,
          "insufficient_stock",
          `Stock insuffisant pour ${found.product.name} (${found.variant.color}, ${found.variant.size}).`,
        );
      }
    }

    const items = payload.items.map((item, i) => {
      const { product, variant } = decrementMockVariantStock(item.product_variant_id, item.quantity);
      const unit_price = product.base_price;
      const subtotal = (parseFloat(unit_price) * item.quantity).toFixed(2);
      return {
        id: Date.now() + i,
        product_variant_id: item.product_variant_id,
        product_name: product.name,
        size: variant.size,
        color: variant.color,
        quantity: item.quantity,
        unit_price,
        subtotal,
      };
    });
    const now = new Date();
    const order = {
      id: Date.now(),
      order_number: `NG-${now.getFullYear()}-${String(mockOrderSeq++).padStart(6, "0")}`,
      customer_name: payload.customer_name,
      customer_phone: payload.customer_phone,
      customer_address: payload.customer_address,
      payment_method: payload.payment_method,
      status: "pending",
      items,
      total_amount: items.reduce((sum, i) => sum + parseFloat(i.subtotal), 0).toFixed(2),
      created_at: now.toISOString(),
    };
    mockStore = [order, ...mockStore];
    persist();
    return simulateDelay({ data: order });
  }
  const { data } = await httpClient.post("/orders", payload);
  return data;
}

export async function trackOrder(orderNumber, phone) {
  if (env.useMocks) {
    const order = mockStore.find(
      (o) => o.order_number === orderNumber && o.customer_phone === phone,
    );
    if (!order) {
      throw mockOrderError(404, "not_found", "Aucune commande trouvée.");
    }
    return simulateDelay({ data: order });
  }
  const { data } = await httpClient.get("/orders/track", { params: { order_number: orderNumber, phone } });
  return data;
}

export async function listOrders(params = {}) {
  if (env.useMocks) {
    let filtered = [...mockStore];
    if (params.status) filtered = filtered.filter((o) => o.status === params.status);
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return simulateDelay(paginate(filtered, params.page || 1, params.page_size || 20));
  }
  const { data } = await httpClient.get("/orders", { params });
  return data;
}

export async function getOrder(id) {
  if (env.useMocks) {
    return simulateDelay({ data: mockStore.find((o) => o.id === Number(id)) });
  }
  const { data } = await httpClient.get(`/orders/${id}`);
  return data;
}

export function getMockOrdersSnapshot() {
  return mockStore;
}

export async function updateOrderStatus(id, status) {
  if (env.useMocks) {
    const numericId = Number(id);
    mockStore = mockStore.map((o) => (o.id === numericId ? { ...o, status } : o));
    persist();
    return simulateDelay({ data: mockStore.find((o) => o.id === numericId) });
  }
  const { data } = await httpClient.patch(`/orders/${id}/status`, { status });
  return data;
}
