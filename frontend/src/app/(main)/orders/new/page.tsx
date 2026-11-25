import type { Metadata } from "next";
import { CreateOrderPage } from "@/views/orders/CreateOrderPage";

export const metadata: Metadata = { title: "New Order" };

export default function Page() {
  return <CreateOrderPage />;
}
