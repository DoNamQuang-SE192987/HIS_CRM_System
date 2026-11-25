import type {
  DamagedStockPayload,
  InventoryItem,
  InventoryTransaction,
  InventoryTransactionQuery,
  Page,
  StockInPayload,
  StockStatus,
} from "@/interfaces";
import { apiRequest } from "./api-client";

export const inventoryService = {
  list: (status?: StockStatus, q?: string) => apiRequest<InventoryItem[]>("/inventory", { query: { status, q } }),

  transactions: (query: InventoryTransactionQuery = {}) =>
    apiRequest<Page<InventoryTransaction>>("/inventory/transactions", { query: { ...query } }),

  stockIn: (payload: StockInPayload) =>
    apiRequest<InventoryTransaction>("/inventory/stock-in", { method: "POST", body: payload }),

  recordDamaged: (payload: DamagedStockPayload) =>
    apiRequest<InventoryTransaction>("/inventory/damaged", { method: "POST", body: payload }),
};
