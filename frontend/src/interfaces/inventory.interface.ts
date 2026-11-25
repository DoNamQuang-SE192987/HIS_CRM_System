import type { StockUnit } from "./common.interface";

export type StockMovementType = "IN" | "OUT" | "DAMAGED";

export interface StockMovement {
  id: string;
  occurredAt: string;
  sku: string;
  productName: string;
  type: StockMovementType;
  /** Signed quantity: positive for inbound, negative for outbound */
  quantity: number;
  unit: StockUnit;
  reference: string;
  /** `null` when the movement was created automatically by the OMS */
  user: { name: string; initials: string } | null;
}

export interface StockInPayload {
  sku: string;
  quantity: number;
  poReference: string;
  notes?: string;
}

export interface DamagedStockPayload {
  sku: string;
  quantity: number;
  reference: string;
  cause: string;
}
