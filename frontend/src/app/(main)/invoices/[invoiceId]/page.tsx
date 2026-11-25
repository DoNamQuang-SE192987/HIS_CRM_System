import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/common";
import { InvoicePage } from "@/views/invoices/InvoicePage";

export const metadata: Metadata = { title: "Invoice" };

export default function Page() {
  return (
    <Suspense fallback={<LoadingState />}>
      <InvoicePage />
    </Suspense>
  );
}
