import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/common";
import { PurchaseOrderDetailPage } from "@/views/purchase-orders/PurchaseOrderDetailPage";

export const metadata: Metadata = { title: "Purchase Order" };

export default function Page() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PurchaseOrderDetailPage />
    </Suspense>
  );
}
