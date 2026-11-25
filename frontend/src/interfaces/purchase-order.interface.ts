export type PurchaseOrderStatus = "draft" | "ordered" | "received";

export interface Supplier {
  id: string;
  name: string;
  description: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  orderDate: string;
  status: PurchaseOrderStatus;
  total: number;
}

export interface PurchaseOrderLine {
  sku: string;
  productName: string;
  quantity: number;
  unitCost: number;
}

export interface PurchaseOrderDraft {
  id: string;
  supplierId: string;
  expectedDeliveryDate: string;
  receivingSurcharge: number;
  lines: PurchaseOrderLine[];
}

export interface PurchaseOrderStats {
  awaitingInbound: number;
  monthlyRestock: number;
}
