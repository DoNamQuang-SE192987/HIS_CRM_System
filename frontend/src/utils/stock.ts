import type { Product, StockStatus, StockUnit } from "@/interfaces";

export function getStockStatus(product: Pick<Product, "stockOnHand" | "minStock">): StockStatus {
  if (product.stockOnHand <= 0) return "out_of_stock";
  if (product.stockOnHand < product.minStock) return "low_stock";
  return "in_stock";
}

/** Compact unit label used in dense tables: "cartons" → "ctns". */
export function abbreviateUnit(unit: StockUnit): string {
  return unit === "cartons" ? "ctns" : unit;
}

/** Product label used on inventory screens, e.g. "Organic Mango Puree 320ml x 24". */
export function getProductLabel(product: Pick<Product, "name" | "packSize">): string {
  return `${product.name} ${product.packSize}`;
}
