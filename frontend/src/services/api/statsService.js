import { env } from "../../config/env";
import { simulateDelay } from "../../mocks";
import httpClient from "./httpClient";
import { getMockOrdersSnapshot } from "./orderService";
import { getMockProductsSnapshot } from "./productService";
import { getMockOwnersCount } from "./accountService";

const LOW_STOCK_THRESHOLD = 5;

function isSameDay(a, b) {
  return a.toDateString() === b.toDateString();
}

function startOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay() === 0 ? 7 : d.getDay();
  d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function revenueSince(orders, since) {
  return orders
    .filter((o) => o.status !== "cancelled" && new Date(o.created_at) >= since)
    .reduce((sum, o) => sum + parseFloat(o.total_amount), 0)
    .toFixed(2);
}

function computeTopProducts(orders) {
  const totals = new Map();
  for (const order of orders) {
    if (order.status === "cancelled") continue;
    for (const item of order.items) {
      const current = totals.get(item.product_name) || { quantity_sold: 0, revenue: 0 };
      current.quantity_sold += item.quantity;
      current.revenue += parseFloat(item.subtotal);
      totals.set(item.product_name, current);
    }
  }
  return [...totals.entries()]
    .map(([product_name, v], index) => ({
      product_id: index + 1,
      product_name,
      quantity_sold: v.quantity_sold,
      revenue: v.revenue.toFixed(2),
    }))
    .sort((a, b) => b.quantity_sold - a.quantity_sold)
    .slice(0, 5);
}

function computeLowStockVariants(products) {
  const rows = [];
  for (const product of products) {
    for (const variant of product.variants) {
      if (variant.stock_quantity <= LOW_STOCK_THRESHOLD) {
        rows.push({
          product_variant_id: variant.id,
          product_name: product.name,
          size: variant.size,
          color: variant.color,
          stock_quantity: variant.stock_quantity,
        });
      }
    }
  }
  return rows.sort((a, b) => a.stock_quantity - b.stock_quantity).slice(0, 20);
}

export async function getOwnerStats() {
  if (env.useMocks) {
    const orders = getMockOrdersSnapshot();
    const products = getMockProductsSnapshot();
    const now = new Date();

    return simulateDelay({
      data: {
        revenue_today: revenueSince(
          orders.filter((o) => isSameDay(new Date(o.created_at), now)),
          new Date(0),
        ),
        revenue_week: revenueSince(orders, startOfWeek(now)),
        revenue_month: revenueSince(orders, startOfMonth(now)),
        pending_orders_count: orders.filter((o) => o.status === "pending").length,
        low_stock_variants: computeLowStockVariants(products),
        top_products: computeTopProducts(orders),
      },
    });
  }
  const { data } = await httpClient.get("/stats/owner");
  return data;
}

export async function getGlobalStats() {
  if (env.useMocks) {
    const orders = getMockOrdersSnapshot();
    return simulateDelay({
      data: {
        total_revenue: revenueSince(orders, new Date(0)),
        orders_count: orders.length,
        owners_count: getMockOwnersCount(),
        top_products: computeTopProducts(orders),
        recent_failed_logins: 0,
      },
    });
  }
  const { data } = await httpClient.get("/stats/global");
  return data;
}
