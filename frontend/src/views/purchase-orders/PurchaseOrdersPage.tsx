"use client";

import { useMemo, useState } from "react";
import { CreatePurchaseOrderCard } from "@/components/purchase-orders/CreatePurchaseOrderCard";
import { PurchaseOrdersTable } from "@/components/purchase-orders/PurchaseOrdersTable";
import { Icon } from "@/components/ui";
import { PURCHASE_ORDER_STATUS_STYLES } from "@/constants";
import type {
  PurchaseOrder,
  PurchaseOrderDraft,
  PurchaseOrderStats,
  PurchaseOrderStatus,
  Supplier,
} from "@/interfaces";
import { cn, formatCurrency } from "@/utils";

type StatusFilter = "all" | PurchaseOrderStatus;
const STATUS_FILTERS: StatusFilter[] = ["all", "draft", "ordered", "received"];

interface PurchaseOrdersPageProps {
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  draft: PurchaseOrderDraft;
  stats: PurchaseOrderStats;
}

export function PurchaseOrdersPage({ purchaseOrders, suppliers, draft, stats }: PurchaseOrdersPageProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [supplierQuery, setSupplierQuery] = useState("");

  const suppliersById = useMemo(
    () => new Map(suppliers.map((supplier) => [supplier.id, supplier])),
    [suppliers],
  );

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = { all: purchaseOrders.length, draft: 0, ordered: 0, received: 0 };
    purchaseOrders.forEach((po) => (result[po.status] += 1));
    return result;
  }, [purchaseOrders]);

  const filtered = useMemo(() => {
    const q = supplierQuery.trim().toLowerCase();
    return purchaseOrders.filter((po) => {
      const matchesStatus = statusFilter === "all" || po.status === statusFilter;
      const supplierName = suppliersById.get(po.supplierId)?.name.toLowerCase() ?? "";
      return matchesStatus && (!q || supplierName.includes(q));
    });
  }, [purchaseOrders, statusFilter, supplierQuery, suppliersById]);

  return (
    <div className="px-margin py-space-xl flex flex-col gap-space-xl max-w-[1440px] mx-auto w-full">
      {/* Title & quick metrics */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
              Inventory Procurement
            </span>
            <span className="text-outline-variant font-label-sm text-label-sm">•</span>
            <span className="font-label-sm text-label-sm text-primary-container font-semibold">FY2025 Cycle</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Purchase Orders</h1>
          <p className="font-body-md text-body-md text-secondary">
            Replenish wholesale inventory from certified food suppliers
          </p>
        </div>
        <div className="flex items-center gap-space-md">
          <div className="bg-surface-container-lowest shadow-sm rounded-xl px-space-lg py-space-sm flex items-center gap-space-md">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <Icon name="pending_actions" className="text-[22px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-secondary">Awaiting Inbound</span>
              <span className="font-headline-sm text-headline-sm text-on-surface tabular-nums">
                {stats.awaitingInbound} Orders
              </span>
            </div>
          </div>
          <div className="bg-surface-container-lowest shadow-sm rounded-xl px-space-lg py-space-sm flex items-center gap-space-md">
            <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center text-primary-container">
              <Icon name="inventory" className="text-[22px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-secondary">Monthly Restock</span>
              <span className="font-headline-sm text-headline-sm text-on-surface tabular-nums">
                {formatCurrency(stats.monthlyRestock)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter items-start">
        {/* Register */}
        <section className="xl:col-span-7 flex flex-col gap-space-md">
          <div className="bg-surface-container-lowest shadow-sm rounded-xl p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg" role="tablist">
              {STATUS_FILTERS.map((value) => {
                const active = statusFilter === value;
                return (
                  <button
                    key={value}
                    role="tab"
                    aria-selected={active}
                    className={cn(
                      "px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-all",
                      active
                        ? "bg-surface-container-lowest text-on-surface shadow-sm"
                        : "text-secondary hover:text-on-surface",
                    )}
                    type="button"
                    onClick={() => setStatusFilter(value)}
                  >
                    {value === "all" ? "All" : PURCHASE_ORDER_STATUS_STYLES[value].label}{" "}
                    <span className="ml-1 text-secondary font-data-mono text-label-sm">{counts[value]}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-space-sm">
              <div className="relative flex items-center w-full sm:w-48">
                <Icon
                  name="filter_list"
                  className="absolute left-space-sm text-secondary text-[18px] pointer-events-none"
                />
                <input
                  className="w-full h-8 pl-8 pr-space-sm rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-colors"
                  placeholder="Filter supplier..."
                  type="text"
                  value={supplierQuery}
                  onChange={(event) => setSupplierQuery(event.target.value)}
                />
              </div>
              <button
                className="p-1.5 rounded-lg bg-surface-container-low text-secondary hover:text-on-surface hover:bg-surface-container transition-colors"
                title="Export CSV"
                type="button"
              >
                <Icon name="download" className="text-[18px]" />
              </button>
            </div>
          </div>

          <PurchaseOrdersTable
            purchaseOrders={filtered}
            suppliersById={suppliersById}
            totalCount={purchaseOrders.length}
          />

          <div className="bg-surface-container-lowest shadow-sm rounded-xl p-space-lg flex items-center gap-space-lg">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex-shrink-0 flex items-center justify-center text-primary-container">
              <Icon name="verified" className="text-[28px]" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface">Certified Wholesale Suppliers</span>
              <p className="font-body-sm text-body-sm text-secondary">
                All vendor catalogs enforce strict lot tracking, food-grade storage specifications, and compliant
                wholesale unit thresholds upon arrival.
              </p>
            </div>
          </div>
        </section>

        {/* Create PO */}
        <section className="xl:col-span-5 flex flex-col gap-space-md sticky top-20">
          <CreatePurchaseOrderCard draft={draft} suppliers={suppliers} />
        </section>
      </div>
    </div>
  );
}
