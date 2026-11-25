"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ErrorBanner, ErrorState, LoadingState, StockStatusBadge } from "@/components/common";
import { BUTTON, Badge, CARD, Icon, TABLE_HEAD_ROW } from "@/components/ui";
import { PURCHASE_ORDER_STATUS_STYLES, ROUTES, can } from "@/constants";
import { useApi } from "@/hooks";
import { purchaseOrderService } from "@/services";
import { toast, useAuthStore } from "@/stores";
import { cn, formatDate, formatDateTime } from "@/utils";

export function PurchaseOrderDetailPage() {
  const { poId } = useParams<{ poId: string }>();
  const id = Number(poId);
  const role = useAuthStore((state) => state.role);
  const { data: po, error, reload } = useApi(() => purchaseOrderService.get(id), [id]);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<unknown>(null);

  if (error) {
    return (
      <div className="p-margin max-w-[1200px] mx-auto w-full">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }
  if (!po) return <LoadingState />;

  const receive = async () => {
    if (!window.confirm(`Receive ${po.code}? ${po.totalQty} unit(s) will be added to stock.`)) return;
    setBusy(true);
    setActionError(null);
    try {
      await purchaseOrderService.receive(po.id);
      toast.success(`${po.code} received — stock updated`);
      reload();
    } catch (err) {
      setActionError(err);
    } finally {
      setBusy(false);
    }
  };

  const status = PURCHASE_ORDER_STATUS_STYLES[po.status];

  return (
    <div className="p-margin max-w-[1200px] mx-auto w-full flex flex-col gap-space-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <nav className="flex items-center gap-space-xs text-secondary font-label-md text-label-md">
            <Link className="hover:text-primary" href={ROUTES.purchaseOrders}>
              Purchase Orders
            </Link>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-on-surface font-semibold">{po.code}</span>
          </nav>
          <div className="flex items-center gap-space-md">
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">{po.code}</h1>
            <Badge className={status.className}>{status.label}</Badge>
          </div>
        </div>
        {po.status === "ORDERED" && can(role, "managePurchaseOrders") && (
          <button className={BUTTON.primary} type="button" onClick={receive} disabled={busy}>
            <Icon name="assignment_turned_in" className="text-[18px]" />
            {busy ? "Receiving..." : "Mark as Received"}
          </button>
        )}
      </div>

      <ErrorBanner error={actionError} onClose={() => setActionError(null)} />

      <div className={cn(CARD, "p-space-lg grid grid-cols-1 md:grid-cols-4 gap-space-md")}>
        <div className="flex flex-col gap-1">
          <span className="font-label-md text-label-md text-secondary">Supplier</span>
          <span className="font-headline-sm text-headline-sm">{po.supplier.name}</span>
          <span className="font-body-sm text-body-sm text-secondary">
            {[po.supplier.contactName, po.supplier.phone].filter(Boolean).join(" · ") || "—"}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-label-md text-label-md text-secondary">Ordered</span>
          <span className="font-headline-sm text-headline-sm">{formatDate(po.orderDate)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-label-md text-label-md text-secondary">Expected</span>
          <span className="font-headline-sm text-headline-sm">{formatDate(po.expectedDate)}</span>
          {po.supplier.leadTimeDays != null && (
            <span className="font-body-sm text-body-sm text-secondary">Lead time ~{po.supplier.leadTimeDays} days</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-label-md text-label-md text-secondary">Received</span>
          <span className="font-headline-sm text-headline-sm">{po.receivedAt ? formatDateTime(po.receivedAt) : "Not yet"}</span>
        </div>
        {po.note && <p className="md:col-span-4 font-body-sm text-body-sm text-secondary"><b className="text-on-surface">Note:</b> {po.note}</p>}
      </div>

      <div className={cn(CARD, "overflow-hidden")}>
        <table className="w-full text-left">
          <thead>
            <tr className={cn(TABLE_HEAD_ROW, "h-10")}>
              <th className="px-space-md">SKU</th>
              <th className="px-space-md">Product</th>
              <th className="px-space-md text-right">Qty ordered</th>
              <th className="px-space-md text-right">Stock now</th>
              <th className="px-space-md text-right">Minimum</th>
              <th className="px-space-md text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm">
            {po.items.map((item) => (
              <tr key={item.id} className="h-12">
                <td className="px-space-md font-data-mono text-primary">{item.sku}</td>
                <td className="px-space-md font-medium">{item.productName}</td>
                <td className="px-space-md text-right font-data-mono font-semibold">{item.qty}</td>
                <td className="px-space-md text-right font-data-mono">{item.currentStock}</td>
                <td className="px-space-md text-right font-data-mono text-secondary">{item.minStock}</td>
                <td className="px-space-md text-center">
                  <StockStatusBadge status={item.stockStatus} />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-surface-container-low/60 font-body-md text-body-md">
              <td className="px-space-md py-3 font-semibold" colSpan={2}>
                Total
              </td>
              <td className="px-space-md py-3 text-right font-data-mono font-bold">{po.totalQty}</td>
              <td colSpan={3} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
