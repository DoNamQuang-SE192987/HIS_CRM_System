import type { Metadata } from "next";
import { purchaseOrderService } from "@/services";
import { PurchaseOrdersPage } from "@/views/purchase-orders/PurchaseOrdersPage";

export const metadata: Metadata = { title: "Purchase Orders" };

export default async function Page() {
  const [purchaseOrders, suppliers, draft, stats] = await Promise.all([
    purchaseOrderService.getPurchaseOrders(),
    purchaseOrderService.getSuppliers(),
    purchaseOrderService.getDraft(),
    purchaseOrderService.getStats(),
  ]);

  return (
    <PurchaseOrdersPage purchaseOrders={purchaseOrders} suppliers={suppliers} draft={draft} stats={stats} />
  );
}
