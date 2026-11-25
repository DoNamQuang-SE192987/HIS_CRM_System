import type { ChannelGroup, OrderDetail, SalesChannel } from "@/interfaces";

export function getChannelGroup(channel: SalesChannel): ChannelGroup {
  return channel === "wholesale" ? "wholesale" : "ecommerce";
}

export function getOrderSubtotal(order: Pick<OrderDetail, "items">): number {
  return order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}
