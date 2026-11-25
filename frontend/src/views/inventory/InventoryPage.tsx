"use client";

import { useMemo, useState } from "react";
import { DamagedStockModal } from "@/components/inventory/DamagedStockModal";
import { InventoryStatCard } from "@/components/inventory/InventoryStatCard";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { StockHistoryTable } from "@/components/inventory/StockHistoryTable";
import { StockInModal } from "@/components/inventory/StockInModal";
import { Icon } from "@/components/ui";
import { useDisclosure } from "@/hooks";
import type { Product, StockMovement, StockStatus } from "@/interfaces";
import { inventoryService } from "@/services/inventory.service";
import { cn, getProductLabel, getStockStatus } from "@/utils";

type InventoryTab = "on-hand" | "history";

interface InventoryPageProps {
  products: Product[];
  movements: StockMovement[];
}

export function InventoryPage({ products, movements }: InventoryPageProps) {
  const [activeTab, setActiveTab] = useState<InventoryTab>("on-hand");
  const [query, setQuery] = useState("");
  const stockInModal = useDisclosure();
  const damagedModal = useDisclosure();

  const counts = useMemo(() => {
    const result: Record<StockStatus, number> = { in_stock: 0, low_stock: 0, out_of_stock: 0 };
    products.forEach((product) => (result[getStockStatus(product)] += 1));
    return result;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (product) =>
        product.sku.toLowerCase().includes(q) || getProductLabel(product).toLowerCase().includes(q),
    );
  }, [products, query]);

  const tabs: { value: InventoryTab; label: string; icon: string; badge: string }[] = [
    { value: "on-hand", label: "Inventory on Hand", icon: "inventory", badge: String(products.length) },
    { value: "history", label: "Stock History", icon: "history", badge: `${movements.length} logs` },
  ];

  return (
    <div className="p-margin max-w-[1440px] mx-auto w-full flex flex-col gap-space-lg">
      {/* Title & actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-sm mb-space-xs">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">
              Warehouse Hub
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span className="font-label-sm text-label-sm text-secondary">Updated 2m ago</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Inventory Management</h1>
          <p className="font-body-md text-body-md text-secondary mt-0.5">
            Track stock on hand, replenishment alerts, and warehouse movements
          </p>
        </div>
        <div className="flex items-center gap-space-sm self-start md:self-auto">
          <button
            className="h-[38px] px-space-md rounded-lg bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container-low transition-colors flex items-center gap-space-xs font-label-md text-label-md"
            type="button"
            onClick={damagedModal.open}
          >
            <Icon name="warning" className="text-[18px] text-error" />
            <span>Record Damaged Goods</span>
          </button>
          <button
            className="h-[38px] px-space-md rounded-lg bg-primary-container text-on-primary shadow-sm hover:opacity-95 transition-opacity flex items-center gap-space-xs font-label-md text-label-md"
            type="button"
            onClick={stockInModal.open}
          >
            <Icon name="add_circle" className="text-[18px]" />
            <span>Stock In</span>
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-space-md">
        <InventoryStatCard
          label="Total Line Items"
          value={products.length}
          hint="Active Catalog"
          hintClassName="text-primary"
          icon="shelves"
          iconClassName="bg-surface-container-low text-secondary"
        />
        <InventoryStatCard
          label="Healthy Stock"
          value={counts.in_stock}
          hint="Optimal levels"
          hintClassName="text-primary"
          icon="check_circle"
          iconClassName="bg-secondary-container text-primary"
        />
        <InventoryStatCard
          label="Low Stock Warnings"
          value={counts.low_stock}
          hint="Reorder recommended"
          hintClassName="text-on-surface-variant"
          icon="trending_down"
          iconClassName="bg-surface-container-high text-on-surface-variant"
        />
        <InventoryStatCard
          label="Critical Depletion"
          value={counts.out_of_stock}
          valueClassName="text-error"
          hint="0 Cartons Left"
          hintClassName="text-error"
          icon="error"
          iconClassName="bg-error-container text-error"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between bg-surface-container-lowest px-space-md pt-space-xs rounded-xl shadow-sm">
        <div className="flex items-center gap-space-sm" role="tablist">
          {tabs.map((tab) => {
            const active = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                role="tab"
                aria-selected={active}
                className={cn(
                  "relative py-space-sm px-space-md font-label-md text-label-md transition-colors flex items-center gap-space-xs",
                  active ? "text-primary font-semibold" : "text-secondary hover:text-on-surface",
                )}
                type="button"
                onClick={() => setActiveTab(tab.value)}
              >
                <Icon name={tab.icon} className="text-[18px]" />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    active ? "bg-primary/10 text-primary" : "bg-surface-container-high text-secondary",
                  )}
                >
                  {tab.badge}
                </span>
                {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
              </button>
            );
          })}
        </div>
        <div className="hidden sm:flex items-center gap-space-sm text-secondary font-label-sm text-label-sm pr-space-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary" /> Live Auto-sync
          </span>
        </div>
      </div>

      {activeTab === "on-hand" ? (
        <div className="flex flex-col gap-space-md" role="tabpanel">
          {/* Toolbar */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
            <div className="relative w-full sm:max-w-md">
              <Icon
                name="search"
                className="absolute left-3 top-2.5 text-secondary text-[18px] pointer-events-none"
              />
              <input
                className="w-full h-[38px] pl-9 pr-space-md bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-all"
                placeholder="Filter by SKU or product name..."
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
              <div className="flex items-center gap-space-xs text-secondary font-label-sm text-label-sm bg-surface-container-low px-space-sm py-1.5 rounded-lg">
                <Icon name="filter_list" className="text-[16px]" />
                <span>Status:</span>
                <span className="font-semibold text-on-surface">All ({products.length})</span>
              </div>
              <button
                className="h-[38px] px-space-md rounded-lg bg-surface-container-low text-secondary hover:text-on-surface transition-colors flex items-center gap-1 font-label-md text-label-md"
                type="button"
              >
                <Icon name="tune" className="text-[16px]" />
                <span>Columns</span>
              </button>
            </div>
          </div>

          <InventoryTable products={filteredProducts} totalCount={products.length} />
        </div>
      ) : (
        <div role="tabpanel">
          <StockHistoryTable movements={movements} />
        </div>
      )}

      <StockInModal
        isOpen={stockInModal.isOpen}
        onClose={stockInModal.close}
        products={products}
        onSubmit={inventoryService.stockIn}
      />
      <DamagedStockModal
        isOpen={damagedModal.isOpen}
        onClose={damagedModal.close}
        products={products}
        onSubmit={inventoryService.recordDamaged}
      />
    </div>
  );
}
