import type {
  Page,
  PurchaseOrderCreatePayload,
  PurchaseOrderDetail,
  PurchaseOrderStatus,
  PurchaseOrderSummary,
  Supplier,
} from "@/interfaces";
import { apiRequest } from "./api-client";

export const supplierService = {
  list: () => apiRequest<Supplier[]>("/suppliers"),
};

export const purchaseOrderService = {
  list: (status?: PurchaseOrderStatus, page = 1, size = 20) =>
    apiRequest<Page<PurchaseOrderSummary>>("/purchase-orders", { query: { status, page, size } }),

  get: (id: number) => apiRequest<PurchaseOrderDetail>(`/purchase-orders/${id}`),

  create: (payload: PurchaseOrderCreatePayload) =>
    apiRequest<PurchaseOrderDetail>("/purchase-orders", { method: "POST", body: payload }),

  /** Adds stock; a second call returns 409 INVALID_STATUS. */
  receive: (id: number) => apiRequest<PurchaseOrderDetail>(`/purchase-orders/${id}/receive`, { method: "POST" }),
};
