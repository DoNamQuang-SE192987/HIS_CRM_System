import { ORDER_DETAILS_MOCK, ORDERS_MOCK, ORDER_STATS_MOCK } from "@/constants/mock-data";
import type { Order, OrderDetail, OrderStats } from "@/interfaces";

export const orderService = {
  async getOrders(): Promise<Order[]> {
    return ORDERS_MOCK;
  },

  async getRecentOrders(limit = 5): Promise<Order[]> {
    return ORDERS_MOCK.slice(0, limit);
  },

  async getOrderStats(): Promise<OrderStats> {
    return ORDER_STATS_MOCK;
  },

  /** Returns `null` when the order does not exist or has no detail record. */
  async getOrderById(orderId: string): Promise<OrderDetail | null> {
    const order = ORDERS_MOCK.find((item) => item.id === orderId);
    const detail = ORDER_DETAILS_MOCK[orderId];
    if (!order || !detail) return null;
    return { ...order, ...detail };
  },

  /** Ids that have a full detail record (used for static generation). */
  async getOrderIdsWithDetail(): Promise<string[]> {
    return Object.keys(ORDER_DETAILS_MOCK);
  },
};
