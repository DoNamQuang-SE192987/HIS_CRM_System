import type {
  InventoryRefType,
  InventoryTransactionType,
  OrderStatus,
  PurchaseOrderStatus,
  SalesChannel,
  StockStatus,
} from "@/interfaces";

interface BadgeStyle {
  label: string;
  className: string;
}

export const ORDER_STATUS_STYLES: Record<OrderStatus, BadgeStyle> = {
  NEW: { label: "New", className: "bg-secondary-container text-on-secondary-fixed" },
  SHIPPED: { label: "Shipped", className: "bg-primary-fixed text-on-primary-fixed-variant" },
  CANCELED: { label: "Canceled", className: "bg-error-container text-on-error-container" },
};

export const SALES_CHANNEL_STYLES: Record<
  SalesChannel,
  { label: string; icon: string; className: string; iconClassName?: string }
> = {
  WHOLESALE: {
    label: "Wholesale",
    icon: "storefront",
    className: "bg-surface-container-low text-on-surface-variant",
    iconClassName: "text-secondary",
  },
  WALMART: {
    label: "Walmart",
    icon: "hub",
    className: "bg-secondary-container/40 text-on-surface",
    iconClassName: "text-tertiary",
  },
  AMAZON: {
    label: "Amazon",
    icon: "shopping_cart",
    className: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  },
};

export const SALES_CHANNELS: SalesChannel[] = ["WHOLESALE", "WALMART", "AMAZON"];

/** Stock status chip (tables). */
export const STOCK_STATUS_STYLES: Record<StockStatus, BadgeStyle & { dotClassName: string }> = {
  IN_STOCK: {
    label: "In stock",
    className: "bg-secondary-container text-primary",
    dotClassName: "bg-primary",
  },
  LOW: {
    label: "Low",
    className: "bg-amber-50 text-amber-800",
    dotClassName: "bg-amber-600",
  },
  OUT: {
    label: "Out",
    className: "bg-error-container text-error",
    dotClassName: "bg-error",
  },
};

export const STOCK_STATUSES: StockStatus[] = ["IN_STOCK", "LOW", "OUT"];

export const INVENTORY_TX_STYLES: Record<
  InventoryTransactionType,
  { className: string; quantityClassName: string }
> = {
  IN: { className: "bg-secondary-container text-primary", quantityClassName: "text-primary" },
  OUT: { className: "bg-secondary-fixed text-tertiary", quantityClassName: "text-secondary" },
  DAMAGED: { className: "bg-error-container text-error", quantityClassName: "text-error" },
};

export const INVENTORY_REF_LABELS: Record<InventoryRefType, string> = {
  SALES_ORDER: "Sales order",
  PURCHASE_ORDER: "Purchase order",
  MANUAL: "Manual",
  OPENING_BALANCE: "Opening balance",
};

export const PURCHASE_ORDER_STATUS_STYLES: Record<PurchaseOrderStatus, BadgeStyle> = {
  ORDERED: { label: "Ordered", className: "bg-surface-container-highest text-primary" },
  RECEIVED: { label: "Received", className: "bg-primary-fixed text-on-primary-fixed-variant" },
};

/** Quick picks for the damage reason (free text is also allowed). */
export const DAMAGE_REASONS = [
  "Vỡ / móp khi bốc dỡ",
  "Hết hạn sử dụng",
  "Rò rỉ / hở nắp",
  "Hư hỏng do nhiệt độ",
] as const;
