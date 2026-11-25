"use client";

import { useState } from "react";
import { ErrorState, LoadingState, PageHeader } from "@/components/common";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { BUTTON, CARD, Icon, Pagination, SearchInput, Select } from "@/components/ui";
import { STOCK_STATUS_STYLES, STOCK_STATUSES, can } from "@/constants";
import { useApi, useDebouncedValue } from "@/hooks";
import type { Product, StockStatus } from "@/interfaces";
import { productService } from "@/services";
import { toast, useAuthStore } from "@/stores";
import { cn, errorMessage } from "@/utils";

const PAGE_SIZE = 12;

export function ProductsCataloguePage() {
  const role = useAuthStore((state) => state.role);
  const canManage = can(role, "manageProducts");

  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [status, setStatus] = useState<StockStatus | "">("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Product | null | undefined>(undefined); // undefined = closed
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const q = useDebouncedValue(query);

  const { data, error, loading, reload } = useApi(
    () => productService.list({ q, brand: brand || undefined, stockStatus: status || undefined, page, size: PAGE_SIZE }),
    [q, brand, status, page],
  );
  // Brand options: one unfiltered call (the catalogue is small).
  const { data: allProducts } = useApi(() => productService.list({ size: 100 }), []);
  const brands = [...new Set((allProducts?.items ?? []).map((p) => p.brand).filter((b): b is string => !!b))].sort();

  const resetFilters = () => {
    setQuery("");
    setBrand("");
    setStatus("");
    setPage(1);
  };

  const toggle = async (product: Product) => {
    setTogglingId(product.id);
    try {
      const updated = await productService.toggle(product.id);
      toast.success(updated.active ? `${updated.sku} is on sale again` : `${updated.sku} discontinued`);
      reload();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="p-margin flex flex-col gap-space-xl max-w-[1440px] mx-auto w-full">
      <PageHeader
        eyebrow="Master SKU database"
        title="Products Catalogue"
        subtitle="Wholesale food items, pack configurations and pricing"
        actions={
          canManage && (
            <button className={BUTTON.primary} type="button" onClick={() => setEditing(null)}>
              <Icon name="add" className="text-[18px]" />
              Add Product
            </button>
          )
        }
      />

      <div className={cn(CARD, "p-space-md flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md")}>
        <SearchInput
          className="flex-1 min-w-[260px]"
          placeholder="Search by SKU or name..."
          value={query}
          onChange={(value) => {
            setQuery(value);
            setPage(1);
          }}
        />
        <div className="flex flex-wrap items-center gap-space-sm">
          <Select
            aria-label="Filter by brand"
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Brands</option>
            {brands.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Filter by stock status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as StockStatus | "");
              setPage(1);
            }}
          >
            <option value="">All Stock Status</option>
            {STOCK_STATUSES.map((item) => (
              <option key={item} value={item}>
                {STOCK_STATUS_STYLES[item].label}
              </option>
            ))}
          </Select>
          <button className={BUTTON.ghost} type="button" onClick={resetFilters}>
            <Icon name="restart_alt" className="text-[16px]" />
            Reset
          </button>
        </div>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data ? (
        <LoadingState />
      ) : (
        <>
          <div className="flex items-center justify-between px-space-xs text-secondary font-label-sm text-label-sm">
            <span>
              {data.totalItems} product(s){loading && " · updating..."}
            </span>
            {!canManage && <span>Only the Manager role can add or edit products</span>}
          </div>
          {data.items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
              {data.items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={canManage ? () => setEditing(product) : undefined}
                  onToggle={canManage ? () => toggle(product) : undefined}
                  toggling={togglingId === product.id}
                />
              ))}
            </div>
          ) : (
            <div className={cn(CARD, "flex flex-col items-center justify-center text-center py-16")}>
              <Icon name="inventory_2" className="text-[32px] text-secondary mb-space-sm" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface">No products match your criteria</h3>
              <button className={cn(BUTTON.secondary, "mt-space-md")} type="button" onClick={resetFilters}>
                Clear all filters
              </button>
            </div>
          )}
          {data.totalPages > 1 && (
            <div className="flex justify-end">
              <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      {editing !== undefined && (
        <ProductFormModal
          product={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            reload();
          }}
        />
      )}
    </div>
  );
}
