import type { StockStatus } from "./product.interface";

export type PurchaseOrderStatus = "ORDERED" | "RECEIVED";

export interface Supplier {
  id: number;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  leadTimeDays: number | null;
}

export interface PurchaseOrderSummary {
  id: number;
  code: string;
  supplierId: number;
  supplierName: string;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDate: string | null;
  lineCount: number;
  totalQty: number;
  receivedAt: string | null;
}

export interface PurchaseOrderItem {
  id: number;
  productId: number;
  sku: string;
  productName: string;
  qty: number;
  currentStock: number;
  minStock: number;
  stockStatus: StockStatus;
}

export interface PurchaseOrderDetail {
  id: number;
  code: string;
  supplier: Supplier;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDate: string | null;
  note: string | null;
  items: PurchaseOrderItem[];
  totalQty: number;
  createdAt: string;
  receivedAt: string | null;
}

export interface PurchaseOrderCreatePayload {
  supplierId: number;
  expectedDate?: string;
  note?: string;
  items: { productId: number; qty: number }[];
}
