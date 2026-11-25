"use client";

import Link from "next/link";
import { Icon } from "@/components/ui";
import { ROUTES } from "@/constants";

export function InvoiceToolbar({ orderId }: { orderId: string }) {
  const print = () => window.print();

  return (
    <div className="print:hidden w-full bg-surface-container-low shadow-sm sticky top-0 z-30 px-space-xl py-space-sm">
      <div className="max-w-5xl mx-auto flex flex-row items-center justify-between gap-space-md">
        <Link
          className="inline-flex items-center gap-space-xs font-label-md text-label-md text-secondary hover:text-primary transition-colors"
          href={ROUTES.orderDetail(orderId)}
        >
          <Icon name="arrow_back" className="text-sm" />
          Back to Order {orderId}
        </Link>
        <div className="flex items-center gap-space-sm">
          <button
            className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-lg font-label-md text-label-md text-on-surface bg-surface-container-lowest hover:bg-surface shadow-sm transition-all"
            type="button"
            onClick={print}
          >
            <Icon name="download" className="text-base text-secondary" />
            Download PDF
          </button>
          <button
            className="inline-flex items-center gap-space-xs px-space-md py-space-xs rounded-lg font-label-md text-label-md text-on-primary bg-primary hover:bg-primary-container shadow-sm transition-all"
            type="button"
            onClick={print}
          >
            <Icon name="print" className="text-base" />
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
