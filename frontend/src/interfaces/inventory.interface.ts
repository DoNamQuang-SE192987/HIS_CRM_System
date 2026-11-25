import type { PriceUnit, StockStatus } from "./product.interface";

export type InventoryTransactionType = "IN" | "OUT" | "DAMAGED";
export type InventoryRefType = "SALES_ORDER" | "PURCHASE_ORDER" | "MANUAL" | "OPENING_BALANCE";

export interface InventoryItem {
  productId: number;
  sku: string;
  name: string;
  brand: string | null;
  packSize: string | null;
  unit: PriceUnit;
  stockQty: number;
  minStock: number;
  status: StockStatus;
  /** Units missing to reach minStock - reorder hint. */
  shortage: number;
  active: boolean;
}

export interface InventoryTransaction {
  id: number;
  createdAt: string;
  productId: number;
  sku: string;
  productName: string;
  type: InventoryTransactionType;
  /** Signed: +IN, -OUT, -DAMAGED */
  quantity: number;
  balanceAfter: number;
  refType: InventoryRefType;
  refId: number | null;
  refCode: string | null;
  note: string | null;
}

export interface InventoryTransactionQuery {
  productId?: number;
  type?: InventoryTransactionType;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface StockInPayload {
  productId: number;
  qty: number;
  note?: string;
}

export interface DamagedStockPayload {
  productId: number;
  qty: number;
  reason: string;
}
