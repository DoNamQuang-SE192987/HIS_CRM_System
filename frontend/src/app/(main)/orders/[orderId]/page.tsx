import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/common";
import { OrderDetailPage } from "@/views/orders/OrderDetailPage";

export const metadata: Metadata = { title: "Order" };

// The order id is only known at request time -> the client view reads it with useParams() inside Suspense.
export default function Page() {
  return (
    <Suspense fallback={<LoadingState />}>
      <OrderDetailPage />
    </Suspense>
  );
}
