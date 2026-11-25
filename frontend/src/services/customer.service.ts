import type { Customer, CustomerPayload, SalesChannel } from "@/interfaces";
import { apiRequest } from "./api-client";

export const customerService = {
  /** channel=WHOLESALE -> wholesale customers only; WALMART / AMAZON -> that marketplace account. */
  list: (channel?: SalesChannel, q?: string) => apiRequest<Customer[]>("/customers", { query: { channel, q } }),

  create: (payload: CustomerPayload) => apiRequest<Customer>("/customers", { method: "POST", body: payload }),
};
