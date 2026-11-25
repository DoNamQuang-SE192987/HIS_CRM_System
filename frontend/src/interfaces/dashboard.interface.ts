import type { InventoryItem } from "./inventory.interface";
import type { OrderSummary, SalesChannel } from "./order.interface";

export interface DashboardSummary {
  ordersToday: number;
  ordersToShip: number;
  ordersToShipByChannel: Record<SalesChannel, number>;
  /** Total of orders SHIPPED this calendar month. */
  revenueThisMonth: number;
  lowStockCount: number;
  overdueCount: number;
  overdueOrders: OrderSummary[];
  lowStockProducts: InventoryItem[];
  recentOrders: OrderSummary[];
  generatedAt: string;
}
