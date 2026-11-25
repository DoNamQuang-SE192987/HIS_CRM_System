import {
  PURCHASE_ORDER_DRAFT_MOCK,
  PURCHASE_ORDER_STATS_MOCK,
  PURCHASE_ORDERS_MOCK,
  SUPPLIERS_MOCK,
} from "@/constants/mock-data";
import type {
  PurchaseOrder,
  PurchaseOrderDraft,
  PurchaseOrderStats,
  Supplier,
} from "@/interfaces";

export const purchaseOrderService = {
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return PURCHASE_ORDERS_MOCK;
  },

  async getSuppliers(): Promise<Supplier[]> {
    return SUPPLIERS_MOCK;
  },

  async getDraft(): Promise<PurchaseOrderDraft> {
    return PURCHASE_ORDER_DRAFT_MOCK;
  },

  async getStats(): Promise<PurchaseOrderStats> {
    return PURCHASE_ORDER_STATS_MOCK;
  },
};
