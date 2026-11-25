import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/common";
import { CreatePurchaseOrderPage } from "@/views/purchase-orders/CreatePurchaseOrderPage";

export const metadata: Metadata = { title: "New Purchase Order" };

// Reads ?productIds= with useSearchParams() -> must sit inside Suspense.
export default function Page() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CreatePurchaseOrderPage />
    </Suspense>
  );
}
