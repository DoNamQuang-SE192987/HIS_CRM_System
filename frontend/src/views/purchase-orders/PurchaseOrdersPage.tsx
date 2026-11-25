"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyRow, ErrorBanner, ErrorState, LoadingState, PageHeader } from "@/components/common";
import { BUTTON, Badge, CARD, Icon, Pagination, TABLE_HEAD_ROW } from "@/components/ui";
import { PURCHASE_ORDER_STATUS_STYLES, ROUTES, can } from "@/constants";
import { useApi } from "@/hooks";
import type { PurchaseOrderStatus, PurchaseOrderSummary } from "@/interfaces";
import { purchaseOrderService } from "@/services";
import { toast, useAuthStore } from "@/stores";
import { cn, formatDate, formatDateTime } from "@/utils";

type Tab = "ALL" | PurchaseOrderStatus;
const TABS: { value: Tab; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ORDERED", label: "Awaiting delivery" },
  { value: "RECEIVED", label: "Received" },
];

export function PurchaseOrdersPage() {
  const role = useAuthStore((state) => state.role);
  const canManage = can(role, "managePurchaseOrders");
  const [tab, setTab] = useState<Tab>("ALL");
  const [page, setPage] = useState(1);
  const [receivingId, setReceivingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);

  const { data, error, loading, reload } = useApi(
    () => purchaseOrderService.list(tab === "ALL" ? undefined : tab, page),
    [tab, page],
  );

  const receive = async (po: PurchaseOrderSummary) => {
    if (!window.confirm(`Receive ${po.code}? ${po.totalQty} unit(s) will be added to stock.`)) return;
    setReceivingId(po.id);
    setActionError(null);
    try {
      await purchaseOrderService.receive(po.id);
      toast.success(`${po.code} received — stock updated`);
      reload();
    } catch (err) {
      setActionError(err);
    } finally {
      setReceivingId(null);
    }
  };

  return (
    <div className="px-margin py-space-xl flex flex-col gap-space-lg max-w-[1440px] mx-auto w-full">
      <PageHeader
        eyebrow="Procurement"
        title="Purchase Orders"
        subtitle="Replenish stock from suppliers. Receiving a PO adds its quantities to inventory."
        actions={
          canManage && (
            <Link className={BUTTON.primary} href={ROUTES.purchaseOrderNew()}>
              <Icon name="add" className="text-[18px]" />
              New Purchase Order
            </Link>
          )
        }
      />

      <ErrorBanner error={actionError} onClose={() => setActionError(null)} />

      <div className={cn(CARD, "overflow-hidden flex flex-col")}>
        <div className="p-space-md">
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg w-fit" role="tablist">
            {TABS.map((item) => {
              const active = tab === item.value;
              return (
                <button
                  key={item.value}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  className={cn(
                    "px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all",
                    active ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-secondary hover:text-on-surface",
                  )}
                  onClick={() => {
                    setTab(item.value);
                    setPage(1);
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {error ? (
          <div className="p-space-md">
            <ErrorState error={error} onRetry={reload} />
          </div>
        ) : !data ? (
          <LoadingState />
        ) : (
          <>
            <div className={cn("overflow-x-auto", loading && "opacity-60")}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={cn(TABLE_HEAD_ROW, "h-10")}>
                    <th className="px-space-md">PO #</th>
                    <th className="px-space-md">Supplier</th>
                    <th className="px-space-md">Ordered</th>
                    <th className="px-space-md">Expected</th>
                    <th className="px-space-md text-right">Lines / Qty</th>
                    <th className="px-space-md">Status</th>
                    <th className="px-space-md text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low">
                  {data.items.map((po) => {
                    const status = PURCHASE_ORDER_STATUS_STYLES[po.status];
                    return (
                      <tr key={po.id} className={cn("h-14 hover:bg-surface-container-low transition-colors", po.status === "ORDERED" && "bg-surface-container-low/40")}>
                        <td className="px-space-md">
                          <Link className="font-data-mono text-body-sm text-primary font-semibold hover:underline" href={ROUTES.purchaseOrderDetail(po.id)}>
                            {po.code}
                          </Link>
                        </td>
                        <td className="px-space-md font-body-md text-body-md text-on-surface font-medium">{po.supplierName}</td>
                        <td className="px-space-md font-body-sm text-body-sm text-secondary whitespace-nowrap">{formatDate(po.orderDate)}</td>
                        <td className="px-space-md font-body-sm text-body-sm text-secondary whitespace-nowrap">{formatDate(po.expectedDate)}</td>
                        <td className="px-space-md text-right font-data-mono text-body-sm">
                          {po.lineCount} / {po.totalQty}
                        </td>
                        <td className="px-space-md">
                          <Badge className={status.className}>{status.label}</Badge>
                          {po.receivedAt && (
                            <span className="block font-label-sm text-label-sm text-secondary mt-0.5">{formatDateTime(po.receivedAt)}</span>
                          )}
                        </td>
                        <td className="px-space-md text-right">
                          {po.status === "ORDERED" && canManage ? (
                            <button
                              className={cn(BUTTON.row, "bg-primary-container hover:bg-primary text-on-primary shadow-sm")}
                              type="button"
                              disabled={receivingId !== null}
                              onClick={() => receive(po)}
                            >
                              <Icon name="check_circle" className="text-[16px]" />
                              {receivingId === po.id ? "Receiving..." : "Mark as Received"}
                            </button>
                          ) : (
                            <Link className={cn(BUTTON.row, "bg-surface-container-low hover:bg-surface-container text-secondary")} href={ROUTES.purchaseOrderDetail(po.id)}>
                              View
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {data.items.length === 0 && <EmptyRow colSpan={7}>No purchase orders yet.</EmptyRow>}
                </tbody>
              </table>
            </div>
            <div className="px-space-md py-space-sm flex items-center justify-between text-secondary font-label-sm text-label-sm">
              <span>{data.totalItems} purchase order(s)</span>
              <Pagination page={data.page} totalPages={Math.max(1, data.totalPages)} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
