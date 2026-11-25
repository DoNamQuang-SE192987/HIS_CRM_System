"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyRow, ErrorState, LoadingState } from "@/components/common";
import { BUTTON, CARD, FORM_CONTROL_CLASS, Pagination, Select, TABLE_HEAD_ROW } from "@/components/ui";
import { INVENTORY_REF_LABELS, INVENTORY_TX_STYLES, ROUTES } from "@/constants";
import { useApi } from "@/hooks";
import type { InventoryItem, InventoryTransaction, InventoryTransactionType } from "@/interfaces";
import { inventoryService } from "@/services";
import { cn, formatDateTime, formatSignedNumber } from "@/utils";

const PAGE_SIZE = 20;

/** Link to the source document of a ledger line (sales order / purchase order), if any. */
function RefCell({ tx }: { tx: InventoryTransaction }) {
  const href =
    tx.refId == null
      ? null
      : tx.refType === "SALES_ORDER"
        ? ROUTES.orderDetail(tx.refId)
        : tx.refType === "PURCHASE_ORDER"
          ? ROUTES.purchaseOrderDetail(tx.refId)
          : null;
  return (
    <div className="flex flex-col">
      {href ? (
        <Link className="font-data-mono text-data-mono text-primary hover:underline" href={href}>
          {tx.refCode}
        </Link>
      ) : (
        <span className="font-data-mono text-data-mono text-secondary">—</span>
      )}
      <span className="font-label-sm text-label-sm text-secondary">{INVENTORY_REF_LABELS[tx.refType]}</span>
    </div>
  );
}

export function TransactionHistory({ products }: { products: InventoryItem[] }) {
  const [productId, setProductId] = useState<number | "">("");
  const [type, setType] = useState<InventoryTransactionType | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const { data, error, loading, reload } = useApi(
    () =>
      inventoryService.transactions({
        productId: productId || undefined,
        type: type || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        size: PAGE_SIZE,
      }),
    [productId, type, from, to, page],
  );

  const resetPage = () => setPage(1);

  return (
    <div className="flex flex-col gap-space-md">
      <div className={cn(CARD, "p-space-md grid grid-cols-1 md:grid-cols-12 gap-space-sm items-end")}>
        <Select
          wrapperClassName="md:col-span-4"
          aria-label="Product"
          value={productId}
          onChange={(e) => {
            setProductId(e.target.value ? Number(e.target.value) : "");
            resetPage();
          }}
        >
          <option value="">All products</option>
          {products.map((p) => (
            <option key={p.productId} value={p.productId}>
              {p.sku} — {p.name}
            </option>
          ))}
        </Select>
        <Select
          wrapperClassName="md:col-span-2"
          aria-label="Type"
          value={type}
          onChange={(e) => {
            setType(e.target.value as InventoryTransactionType | "");
            resetPage();
          }}
        >
          <option value="">All types</option>
          <option value="IN">IN</option>
          <option value="OUT">OUT</option>
          <option value="DAMAGED">DAMAGED</option>
        </Select>
        <label className="md:col-span-2 flex flex-col gap-1 font-label-sm text-label-sm text-secondary">
          From
          <input type="date" className={FORM_CONTROL_CLASS} value={from} max={to || undefined} onChange={(e) => { setFrom(e.target.value); resetPage(); }} />
        </label>
        <label className="md:col-span-2 flex flex-col gap-1 font-label-sm text-label-sm text-secondary">
          To
          <input type="date" className={FORM_CONTROL_CLASS} value={to} min={from || undefined} onChange={(e) => { setTo(e.target.value); resetPage(); }} />
        </label>
        <button
          className={cn(BUTTON.ghost, "md:col-span-2")}
          type="button"
          onClick={() => {
            setProductId("");
            setType("");
            setFrom("");
            setTo("");
            resetPage();
          }}
        >
          Reset
        </button>
      </div>

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data ? (
        <LoadingState />
      ) : (
        <div className={cn(CARD, "overflow-hidden")}>
          <div className={cn("overflow-x-auto transition-opacity", loading && "opacity-60")}>
            <table className="w-full text-left">
              <thead>
                <tr className={cn(TABLE_HEAD_ROW, "h-10")}>
                  <th className="px-space-md">Date &amp; time</th>
                  <th className="px-space-md">Product</th>
                  <th className="px-space-md text-center w-28">Type</th>
                  <th className="px-space-md text-right w-28">Qty</th>
                  <th className="px-space-md text-right w-28">Balance</th>
                  <th className="px-space-md w-44">Document</th>
                  <th className="px-space-md">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm text-on-surface">
                {data.items.map((tx) => {
                  const style = INVENTORY_TX_STYLES[tx.type];
                  return (
                    <tr key={tx.id} className="hover:bg-surface-container-low/50 h-12">
                      <td className="px-space-md font-data-mono text-data-mono text-secondary whitespace-nowrap">
                        {formatDateTime(tx.createdAt)}
                      </td>
                      <td className="px-space-md font-medium">
                        <span className="font-data-mono text-primary">{tx.sku}</span> · {tx.productName}
                      </td>
                      <td className="px-space-md text-center">
                        <span className={cn("inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold", style.className)}>
                          {tx.type}
                        </span>
                      </td>
                      <td className={cn("px-space-md text-right font-data-mono text-data-mono font-semibold", style.quantityClassName)}>
                        {formatSignedNumber(tx.quantity)}
                      </td>
                      <td className="px-space-md text-right font-data-mono text-data-mono">{tx.balanceAfter}</td>
                      <td className="px-space-md">
                        <RefCell tx={tx} />
                      </td>
                      <td className="px-space-md text-secondary max-w-[260px] truncate" title={tx.note ?? ""}>
                        {tx.note ?? "—"}
                      </td>
                    </tr>
                  );
                })}
                {data.items.length === 0 && <EmptyRow colSpan={7}>No stock movements match your filters.</EmptyRow>}
              </tbody>
            </table>
          </div>
          <div className="px-space-md py-space-sm flex items-center justify-between text-secondary font-label-sm text-label-sm">
            <span>{data.totalItems} movement(s)</span>
            <Pagination page={data.page} totalPages={Math.max(1, data.totalPages)} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
}
