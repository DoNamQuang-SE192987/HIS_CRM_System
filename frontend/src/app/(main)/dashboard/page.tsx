import type { Metadata } from "next";
import { dashboardService, orderService, productService } from "@/services";
import { DashboardPage } from "@/views/dashboard/DashboardPage";

export const metadata: Metadata = { title: "Dashboard" };

export default async function Page() {
  const [stats, lowStockProducts, recentOrders] = await Promise.all([
    dashboardService.getStats(),
    productService.getLowStockProducts(),
    orderService.getRecentOrders(5),
  ]);

  return <DashboardPage stats={stats} lowStockProducts={lowStockProducts} recentOrders={recentOrders} />;
}
