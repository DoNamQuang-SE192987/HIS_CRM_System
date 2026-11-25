"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { Icon } from "@/components/ui";
import { PRODUCT_STATUS_STYLES } from "@/constants";
import type { Product, StockStatus } from "@/interfaces";
import { getStockStatus } from "@/utils";

const ALL = "All";
const STATUS_ORDER: StockStatus[] = ["in_stock", "low_stock", "out_of_stock"];
const FILTER_SELECT_CLASS =
  "appearance-none h-[38px] pl-space-md pr-10 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md cursor-pointer hover:bg-surface-container-high/60 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors";

export function ProductsCataloguePage({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState<string>(ALL);
  const [status, setStatus] = useState<StockStatus | typeof ALL>(ALL);

  const brands = useMemo(() => [...new Set(products.map((product) => product.brand))], [products]);

  const statusCounts = useMemo(() => {
    const counts: Record<StockStatus, number> = { in_stock: 0, low_stock: 0, out_of_stock: 0 };
    products.forEach((product) => (counts[getStockStatus(product)] += 1));
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery =
        !q ||
        product.sku.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        product.name.toLowerCase().includes(q);
      const matchesBrand = brand === ALL || product.brand === brand;
      const matchesStatus = status === ALL || getStockStatus(product) === status;
      return matchesQuery && matchesBrand && matchesStatus;
    });
  }, [products, query, brand, status]);

  const resetFilters = () => {
    setQuery("");
    setBrand(ALL);
    setStatus(ALL);
  };

  return (
    <div className="p-margin flex flex-col gap-space-xl max-w-[1440px] mx-auto w-full">
      {/* Title & actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm text-secondary">
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Inventory Operations</span>
            <span className="text-outline-variant">•</span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider">Master SKU Database</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Products Catalogue</h1>
          <p className="font-body-md text-body-md text-secondary">
            Browse wholesale food inventory, pack configurations, and pricing
          </p>
        </div>
        <div className="flex items-center gap-space-sm">
          <button
            className="h-[38px] px-space-md rounded-lg bg-primary text-on-primary font-label-md text-label-md flex items-center gap-space-xs shadow-sm hover:opacity-90 active:scale-[0.99] transition-all"
            type="button"
          >
            <Icon name="add" className="text-[18px]" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search & filters */}
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
        <div className="relative flex-1 min-w-[280px]">
          <Icon
            name="search"
            className="absolute left-space-md top-1/2 -translate-y-1/2 text-secondary text-[20px] pointer-events-none"
          />
          <input
            className="w-full h-[38px] pl-10 pr-space-md rounded-lg bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Search products by SKU, brand, or name..."
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="relative">
            <select
              className={FILTER_SELECT_CLASS}
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
              aria-label="Filter by brand"
            >
              <option value={ALL}>All Brands</option>
              {brands.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <Icon
              name="expand_more"
              className="absolute right-space-sm top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[18px]"
            />
          </div>
          <div className="relative">
            <select
              className={FILTER_SELECT_CLASS}
              value={status}
              onChange={(event) => setStatus(event.target.value as StockStatus | typeof ALL)}
              aria-label="Filter by stock status"
            >
              <option value={ALL}>All Stock Status</option>
              {STATUS_ORDER.map((item) => (
                <option key={item} value={item}>
                  {PRODUCT_STATUS_STYLES[item].label}
                </option>
              ))}
            </select>
            <Icon
              name="expand_more"
              className="absolute right-space-sm top-1/2 -translate-y-1/2 text-secondary pointer-events-none text-[18px]"
            />
          </div>
          <button
            className="h-[38px] px-space-md rounded-lg text-secondary hover:bg-surface-container-low font-label-md text-label-md transition-colors flex items-center gap-1"
            type="button"
            onClick={resetFilters}
          >
            <Icon name="restart_alt" className="text-[16px]" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Counter & legend */}
      <div className="flex items-center justify-between px-space-xs text-secondary font-label-sm text-label-sm">
        <span>
          Showing {filteredProducts.length} of {products.length} catalogue SKUs
        </span>
        <div className="flex items-center gap-space-md">
          {STATUS_ORDER.map((item) => (
            <span key={item} className="inline-flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${PRODUCT_STATUS_STYLES[item].dotClassName}`} />{" "}
              {PRODUCT_STATUS_STYLES[item].label} ({statusCounts[item]})
            </span>
          ))}
        </div>
      </div>

      {/* Grid / empty state */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
          {filteredProducts.map((product) => (
            <ProductCard key={product.sku} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-space-xl bg-surface-container-lowest rounded-xl shadow-sm text-center py-16">
          <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-secondary mb-space-sm">
            <Icon name="inventory_2" className="text-[24px]" />
          </div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">No products match your criteria</h3>
          <p className="font-body-sm text-body-sm text-secondary max-w-sm mt-space-xs mb-space-md">
            Try adjusting your keyword search, selecting a different brand, or clearing the stock status filter.
          </p>
          <button
            className="h-[38px] px-space-md rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-container-highest transition-colors"
            type="button"
            onClick={resetFilters}
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
