import { createContext, useEffect, useMemo, useState } from "react";
import { readJSON, writeJSON } from "../utils/secureStorage";

export const CartContext = createContext(null);

const CART_STORAGE_KEY = "ng_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readJSON(CART_STORAGE_KEY, []));

  useEffect(() => {
    writeJSON(CART_STORAGE_KEY, items);
  }, [items]);

  function addItem(newItem) {
    setItems((current) => {
      const existing = current.find((i) => i.product_variant_id === newItem.product_variant_id);
      if (existing) {
        return current.map((i) =>
          i.product_variant_id === newItem.product_variant_id
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i,
        );
      }
      return [...current, newItem];
    });
  }

  function updateQuantity(productVariantId, quantity) {
    setItems((current) =>
      current.map((i) => (i.product_variant_id === productVariantId ? { ...i, quantity } : i)),
    );
  }

  function removeItem(productVariantId) {
    setItems((current) => current.filter((i) => i.product_variant_id !== productVariantId));
  }

  function clearCart() {
    setItems([]);
  }

  const totalQuantity = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalAmount = useMemo(
    () => items.reduce((sum, i) => sum + parseFloat(i.unit_price) * i.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, addItem, updateQuantity, removeItem, clearCart, totalQuantity, totalAmount }),
    [items, totalQuantity, totalAmount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
