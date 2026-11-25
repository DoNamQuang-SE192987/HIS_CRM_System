"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyRow, StockStatusBadge } from "@/components/common";
import { BUTTON, CARD, Icon, TABLE_HEAD_ROW } from "@/components/ui";
import { ROUTES } from "@/constants";
import type { InventoryItem } from "@/interfaces";
import { cn } from "@/utils";

interface LowStockCardProps {
  products: InventoryItem[];
  totalCount: number;
}

/** Products below minStock. Pick some (or all) and jump to a pre-filled purchase order. */
export function LowStockCard({ products, totalCount }: LowStockCardProps) {
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const ids = selected.size > 0 ? [...selected] : products.map((p) => p.productId);
  const allSelected = products.length > 0 && products.every((p) => selected.has(p.productId));

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className={cn(CARD, "overflow-hidden flex flex-col")}>
      <div className="px-6 py-4 flex items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-error" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Low Stock Alert</h2>
          <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
            {totalCount} items
          </span>
        </div>
        <Link
          href={ROUTES.purchaseOrderNew(ids)}
          aria-disabled={products.length === 0}
          className={cn(BUTTON.primary, "h-8 px-3", products.length === 0 && "pointer-events-none opacity-50")}
        >
          <Icon name="add_shopping_cart" className="text-[16px]" />
          Create PO {selected.size > 0 ? `(${selected.size})` : "(all)"}
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={TABLE_HEAD_ROW}>
              <th className="py-3 pl-6 pr-2 w-8">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-primary cursor-pointer"
                  checked={allSelected}
                  aria-label="Select all"
                  onChange={(e) =>
                    setSelected(e.target.checked ? new Set(products.map((p) => p.productId)) : new Set())
                  }
                />
              </th>
              <th className="py-3 px-3 font-semibold">Product &amp; SKU</th>
              <th className="py-3 px-3 font-semibold text-right">Stock</th>
              <th className="py-3 px-3 font-semibold text-right">Min</th>
              <th className="py-3 px-3 font-semibold text-right">Need</th>
              <th className="py-3 px-6 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm text-on-surface">
            {products.map((product) => (
              <tr key={product.productId} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-3 pl-6 pr-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-primary cursor-pointer"
                    checked={selected.has(product.productId)}
                    aria-label={`Select ${product.sku}`}
                    onChange={() => toggle(product.productId)}
                  />
                </td>
                <td className="py-3 px-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-on-surface">{product.name}</span>
                    <span className="font-label-sm text-label-sm text-secondary">
                      {product.sku}
                      {product.packSize && ` · ${product.packSize}`}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-data-mono text-data-mono font-semibold text-error">
                  {product.stockQty}
                </td>
                <td className="py-3 px-3 text-right font-data-mono text-data-mono text-secondary">{product.minStock}</td>
                <td className="py-3 px-3 text-right font-data-mono text-data-mono font-semibold">{product.shortage}</td>
                <td className="py-3 px-6 text-center">
                  <StockStatusBadge status={product.status} />
                </td>
              </tr>
            ))}
            {products.length === 0 && <EmptyRow colSpan={6}>All active products are above their minimum stock.</EmptyRow>}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-surface-container-low/40 flex items-center justify-between text-secondary font-label-sm text-label-sm">
        <span>“Need” = units missing to reach the minimum (pre-filled on the PO)</span>
        <Link className="text-primary font-medium hover:underline flex items-center gap-1" href={ROUTES.inventory}>
          Open inventory
          <Icon name="arrow_forward" className="text-[14px]" />
        </Link>
      </div>
    </div>
  );
}
