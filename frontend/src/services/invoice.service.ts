import type { Invoice } from "@/interfaces";
import { apiRequest } from "./api-client";

export const invoiceService = {
  get: (id: number) => apiRequest<Invoice>(`/invoices/${id}`),
};
