import type {
  OrderStatus,
  PurchaseOrderStatus,
  SalesChannel,
  StockMovementType,
  StockStatus,
} from "@/interfaces";

interface BadgeStyle {
  label: string;
  className: string;
}

export const ORDER_STATUS_STYLES: Record<OrderStatus, BadgeStyle> = {
  new: { label: "New", className: "bg-secondary-container text-on-secondary-fixed" },
  shipped: { label: "Shipped", className: "bg-primary-fixed text-on-primary-fixed-variant" },
  canceled: { label: "Canceled", className: "bg-error-container text-on-error-container" },
};

export const SALES_CHANNEL_STYLES: Record<
  SalesChannel,
  { label: string; icon: string; className: string; iconClassName?: string }
> = {
  wholesale: {
    label: "Wholesale",
    icon: "storefront",
    className: "bg-surface-container-low text-on-surface-variant",
    iconClassName: "text-secondary",
  },
  walmart: {
    label: "Walmart",
    icon: "hub",
    className: "bg-secondary-container/40 text-on-surface",
    iconClassName: "text-tertiary",
  },
  amazon: {
    label: "Amazon",
    icon: "shopping_cart",
    className: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
  },
};

/** Stock status chip on the inventory table. */
export const INVENTORY_STATUS_STYLES: Record<StockStatus, BadgeStyle & { dotClassName: string }> = {
  in_stock: {
    label: "In stock",
    className: "bg-secondary-container text-primary",
    dotClassName: "bg-secondary-container",
  },
  low_stock: {
    label: "Low",
    className: "bg-surface-container-high text-on-surface-variant",
    dotClassName: "bg-surface-variant",
  },
  out_of_stock: {
    label: "Out",
    className: "bg-error-container text-error",
    dotClassName: "bg-error",
  },
};

/** Stock status chip on the product catalogue cards. */
export const PRODUCT_STATUS_STYLES: Record<StockStatus, BadgeStyle & { dotClassName: string }> = {
  in_stock: {
    label: "In Stock",
    className: "bg-emerald-50 text-emerald-800",
    dotClassName: "bg-emerald-600",
  },
  low_stock: {
    label: "Low Stock",
    className: "bg-amber-50 text-amber-800",
    dotClassName: "bg-amber-600",
  },
  out_of_stock: {
    label: "Out of Stock",
    className: "bg-rose-50 text-rose-800",
    dotClassName: "bg-rose-600",
  },
};

export const STOCK_MOVEMENT_STYLES: Record<
  StockMovementType,
  { className: string; quantityClassName: string }
> = {
  IN: { className: "bg-secondary-container text-primary", quantityClassName: "text-primary" },
  OUT: { className: "bg-secondary-fixed text-tertiary", quantityClassName: "text-secondary" },
  DAMAGED: { className: "bg-error-container text-error", quantityClassName: "text-error" },
};

export const PURCHASE_ORDER_STATUS_STYLES: Record<PurchaseOrderStatus, BadgeStyle> = {
  draft: { label: "Draft", className: "bg-surface-container text-secondary" },
  ordered: { label: "Ordered", className: "bg-surface-container-highest text-primary" },
  received: { label: "Received", className: "bg-primary-fixed text-on-primary-fixed-variant" },
};

export const DAMAGE_CAUSES = [
  "Crushed packaging in handling",
  "Expired / Past best-before date",
  "Seal compromise / Leakage",
  "Temperature fluctuation failure",
] as const;
