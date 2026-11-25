import type { Metadata } from "next";
import { OrdersListPage } from "@/views/orders/OrdersListPage";

export const metadata: Metadata = { title: "Orders" };

export default function Page() {
  return <OrdersListPage />;
}
