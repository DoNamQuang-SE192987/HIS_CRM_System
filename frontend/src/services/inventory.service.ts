import { STOCK_MOVEMENTS_MOCK } from "@/constants/mock-data";
import type { DamagedStockPayload, StockInPayload, StockMovement } from "@/interfaces";

export const inventoryService = {
  async getStockMovements(): Promise<StockMovement[]> {
    return STOCK_MOVEMENTS_MOCK;
  },

  async stockIn(payload: StockInPayload): Promise<void> {
    // TODO: POST /inventory/stock-in
    console.info("[inventoryService] stockIn", payload);
  },

  async recordDamaged(payload: DamagedStockPayload): Promise<void> {
    // TODO: POST /inventory/damaged
    console.info("[inventoryService] recordDamaged", payload);
  },
};
