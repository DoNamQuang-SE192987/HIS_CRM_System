import type { Metadata } from "next";
import { orderService } from "@/services";
import { OrdersListPage } from "@/views/orders/OrdersListPage";

export const metadata: Metadata = { title: "Orders" };

export default async function Page() {
  const [orders, stats] = await Promise.all([orderService.getOrders(), orderService.getOrderStats()]);

  return <OrdersListPage orders={orders} stats={stats} />;
}
