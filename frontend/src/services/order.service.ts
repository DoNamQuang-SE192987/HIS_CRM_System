import type {
  Invoice,
  OrderCreatePayload,
  OrderDetail,
  OrderImportResult,
  OrderQuery,
  OrderSummary,
  Page,
  SalesChannel,
} from "@/interfaces";
import { apiRequest, apiText } from "./api-client";

export const orderService = {
  list: (query: OrderQuery = {}) => apiRequest<Page<OrderSummary>>("/orders", { query: { ...query } }),

  get: (id: number) => apiRequest<OrderDetail>(`/orders/${id}`),

  create: (payload: OrderCreatePayload) => apiRequest<OrderDetail>("/orders", { method: "POST", body: payload }),

  /** 409 INSUFFICIENT_STOCK lists every short SKU in ApiError.shortages. */
  ship: (id: number) => apiRequest<OrderDetail>(`/orders/${id}/ship`, { method: "POST" }),

  cancel: (id: number) => apiRequest<OrderDetail>(`/orders/${id}/cancel`, { method: "POST" }),

  /** Idempotent: returns the existing invoice if the order already has one. */
  issueInvoice: (id: number) => apiRequest<Invoice>(`/orders/${id}/invoice`, { method: "POST" }),

  importCsv: (channel: SalesChannel, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest<OrderImportResult>("/orders/import", { method: "POST", query: { channel }, formData });
  },

  importTemplate: () => apiText("/orders/import/template"),
};
