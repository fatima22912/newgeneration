export const STORE = {
  name: "New Generation",
  phones: ["76 410 10 69", "71 038 13 70"],
  addresses: ["Sandaga, rue El Malick, Dakar", "Sandaga, rue Valmy, Dakar"],
  instagramUrl: "https://www.instagram.com/newgeneration_dkr",
  tiktokUrl: "https://vt.tiktok.com/ZSXLYcJDs/",
  wavePaymentUrl: "https://pay.wave.com/m/M_3ozQz0pOoE_4/c/sn/",
};

export const PAYMENT_METHODS = [
  { value: "wave", label: "Wave" },
  { value: "orange_money", label: "Orange Money" },
  { value: "cash_on_delivery", label: "Paiement en boutique" },
];

export const ORDER_STATUS_LABELS = {
  pending: "En attente",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
};

export const ORDER_STATUS_ORDER = ["pending", "processing", "shipped", "delivered", "cancelled"];

export const DEFAULT_PAGE_SIZE = 20;

export const PRODUCT_CATEGORIES_HINT = ["T-shirts", "Maillots", "Pantalons", "Bonnets", "Pulls"];
