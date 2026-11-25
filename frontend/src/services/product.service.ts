import type { Page, Product, ProductPayload, ProductQuery } from "@/interfaces";
import { apiRequest } from "./api-client";

export const productService = {
  list: (query: ProductQuery = {}) => apiRequest<Page<Product>>("/products", { query: { ...query } }),

  get: (id: number) => apiRequest<Product>(`/products/${id}`),

  create: (payload: ProductPayload) => apiRequest<Product>("/products", { method: "POST", body: payload }),

  /** Stock is never sent - it only changes through warehouse operations. */
  update: (id: number, payload: Omit<ProductPayload, "stockQty">) =>
    apiRequest<Product>(`/products/${id}`, { method: "PUT", body: payload }),

  toggle: (id: number) => apiRequest<Product>(`/products/${id}/toggle`, { method: "PATCH" }),
};
