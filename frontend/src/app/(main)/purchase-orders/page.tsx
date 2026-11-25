import type { Metadata } from "next";
import { PurchaseOrdersPage } from "@/views/purchase-orders/PurchaseOrdersPage";

export const metadata: Metadata = { title: "Purchase Orders" };

export default function Page() {
  return <PurchaseOrdersPage />;
}
