"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyRow, ErrorState, LoadingState, PageHeader, StockStatusBadge } from "@/components/common";
import { DamagedStockModal } from "@/components/inventory/DamagedStockModal";
import { InventoryStatCard } from "@/components/inventory/InventoryStatCard";
import { StockInModal } from "@/components/inventory/StockInModal";
import { TransactionHistory } from "@/components/inventory/TransactionHistory";
import { BUTTON, CARD, Icon, SearchInput, Select, TABLE_HEAD_ROW } from "@/components/ui";
import { ROUTES, STOCK_STATUS_STYLES, STOCK_STATUSES, can } from "@/constants";
import { useApi } from "@/hooks";
import type { StockStatus } from "@/interfaces";
import { inventoryService } from "@/services";
import { useAuthStore } from "@/stores";
import { cn } from "@/utils";

type Tab = "on-hand" | "history";

export function InventoryPage() {
  const role = useAuthStore((state) => state.role);
  const canAdjust = can(role, "adjustStock");
  const [tab, setTab] = useState<Tab>("on-hand");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StockStatus | "">("");
  const [modal, setModal] = useState<"in" | "damaged" | null>(null);

  // Full list once (small catalogue): feeds the KPIs, the table filters and the modal product pickers.
  const { data, error, reload } = useApi(() => inventoryService.list(), []);
  const [historyKey, setHistoryKey] = useState(0);

  const items = data ?? [];
  const q = query.trim().toLowerCase();
  const visible = items.filter(
    (item) =>
      (!status || item.status === status) &&
      (!q || item.sku.toLowerCase().includes(q) || item.name.toLowerCase().includes(q)),
  );
  const count = (s: StockStatus) => items.filter((item) => item.status === s).length;
  const reorderIds = visible.filter((item) => item.status !== "IN_STOCK" && item.active).map((item) => item.productId);

  const afterChange = () => {
    setModal(null);
    reload();
    setHistoryKey((key) => key + 1);
  };

  return (
    <div className="p-margin max-w-[1440px] mx-auto w-full flex flex-col gap-space-lg">
      <PageHeader
        eyebrow="Warehouse hub"
        title="Inventory"
        subtitle="Stock on hand and every movement: sales shipments, PO receipts, manual stock-in and write-offs"
        actions={
          canAdjust && (
            <>
              <button className={BUTTON.secondary} type="button" onClick={() => setModal("damaged")} disabled={!data}>
                <Icon name="warning" className="text-[18px] text-error" />
                Record Damaged
              </button>
              <button className={BUTTON.primary} type="button" onClick={() => setModal("in")} disabled={!data}>
                <Icon name="add_circle" className="text-[18px]" />
                Stock In
              </button>
            </>
          )
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
            <InventoryStatCard label="Products" value={items.length} hint="In the catalogue" hintClassName="text-primary" icon="shelves" iconClassName="bg-surface-container-low text-secondary" />
            <InventoryStatCard label="Healthy" value={count("IN_STOCK")} hint="At or above minimum" hintClassName="text-primary" icon="check_circle" iconClassName="bg-secondary-container text-primary" />
            <InventoryStatCard label="Low stock" value={count("LOW")} hint="Reorder recommended" hintClassName="text-amber-800" icon="trending_down" iconClassName="bg-amber-50 text-amber-800" />
            <InventoryStatCard label="Out of stock" value={count("OUT")} valueClassName="text-error" hint="Cannot ship" hintClassName="text-error" icon="error" iconClassName="bg-error-container text-error" />
          </div>

          <div className={cn(CARD, "flex items-center px-space-md pt-space-xs")} role="tablist">
            {(
              [
                { value: "on-hand", label: "Stock on hand", icon: "inventory" },
                { value: "history", label: "History", icon: "history" },
              ] as const
            ).map((item) => {
              const active = tab === item.value;
              return (
                <button
                  key={item.value}
                  role="tab"
                  aria-selected={active}
                  type="button"
                  className={cn(
                    "relative py-space-sm px-space-md font-label-md text-label-md flex items-center gap-space-xs",
                    active ? "text-primary font-semibold" : "text-secondary hover:text-on-surface",
                  )}
                  onClick={() => setTab(item.value)}
                >
                  <Icon name={item.icon} className="text-[18px]" />
                  {item.label}
                  {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
                </button>
              );
            })}
          </div>

          {tab === "on-hand" ? (
            <div className="flex flex-col gap-space-md" role="tabpanel">
              <div className={cn(CARD, "p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md")}>
                <SearchInput className="w-full sm:max-w-md" placeholder="Filter by SKU or name..." value={query} onChange={setQuery} />
                <div className="flex items-center gap-space-sm">
                  <Select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value as StockStatus | "")}>
                    <option value="">All statuses</option>
                    {STOCK_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STOCK_STATUS_STYLES[s].label}
                      </option>
                    ))}
                  </Select>
                  {can(role, "managePurchaseOrders") && reorderIds.length > 0 && (
                    <Link className={BUTTON.secondary} href={ROUTES.purchaseOrderNew(reorderIds)}>
                      <Icon name="add_shopping_cart" className="text-[18px]" />
                      Reorder {reorderIds.length} low item(s)
                    </Link>
                  )}
                </div>
              </div>

              <div className={cn(CARD, "overflow-hidden")}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className={cn(TABLE_HEAD_ROW, "h-10")}>
                        <th className="px-space-md w-32">SKU</th>
                        <th className="px-space-md">Product</th>
                        <th className="px-space-md text-right w-32">On hand</th>
                        <th className="px-space-md text-right w-32">Minimum</th>
                        <th className="px-space-md text-right w-28">Need</th>
                        <th className="px-space-md text-center w-32">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm text-on-surface">
                      {visible.map((item) => (
                        <tr key={item.productId} className={cn("hover:bg-surface-container-low/50 h-12", !item.active && "opacity-60")}>
                          <td className={cn("px-space-md font-data-mono text-data-mono font-medium", item.status === "OUT" ? "text-error" : "text-primary")}>
                            {item.sku}
                          </td>
                          <td className="px-space-md font-medium">
                            {item.name}
                            {item.packSize && <span className="text-secondary font-normal"> · {item.packSize}</span>}
                            {!item.active && <span className="ml-2 font-label-sm text-label-sm text-secondary">(discontinued)</span>}
                          </td>
                          <td className="px-space-md text-right font-data-mono text-data-mono font-semibold">
                            {item.stockQty} <span className="text-secondary font-normal">{item.unit === "BAG" ? "bags" : "ctns"}</span>
                          </td>
                          <td className="px-space-md text-right font-data-mono text-data-mono text-secondary">{item.minStock}</td>
                          <td className="px-space-md text-right font-data-mono text-data-mono">{item.shortage || "—"}</td>
                          <td className="px-space-md text-center">
                            <StockStatusBadge status={item.status} />
                          </td>
                        </tr>
                      ))}
                      {visible.length === 0 && <EmptyRow colSpan={6}>No items match your filter.</EmptyRow>}
                    </tbody>
                  </table>
                </div>
                <div className="px-space-md py-space-sm text-secondary font-label-sm text-label-sm">
                  Showing {visible.length} of {items.length} products
                </div>
              </div>
            </div>
          ) : (
            <div role="tabpanel">
              <TransactionHistory key={historyKey} products={items} />
            </div>
          )}
        </>
      )}

      {modal === "in" && data && <StockInModal products={items} onClose={() => setModal(null)} onDone={afterChange} />}
      {modal === "damaged" && data && <DamagedStockModal products={items} onClose={() => setModal(null)} onDone={afterChange} />}
    </div>
  );
}
