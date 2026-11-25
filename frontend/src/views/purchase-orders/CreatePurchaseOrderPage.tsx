"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ErrorBanner, ErrorState, LoadingState, PageHeader, RoleHint, StockStatusBadge } from "@/components/common";
import { BUTTON, CARD, FORM_CONTROL_CLASS, FormField, Icon, Select, TEXTAREA_CLASS } from "@/components/ui";
import { ROUTES, can, rolesFor } from "@/constants";
import { useApi } from "@/hooks";
import type { InventoryItem } from "@/interfaces";
import { inventoryService, purchaseOrderService, supplierService } from "@/services";
import { toast, useAuthStore } from "@/stores";
import { cn, fieldErrorsOf, todayIso } from "@/utils";

interface Line {
  key: number;
  productId: number | "";
  qty: number;
}

let lineKey = 1;

/** Suggested order qty: what is missing to reach minStock, at least 1. */
const suggestedQty = (item: InventoryItem | undefined) => Math.max(1, item?.shortage ?? 1);

function PurchaseOrderForm({ products, preselected }: { products: InventoryItem[]; preselected: number[] }) {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const allowed = can(role, "managePurchaseOrders");
  const productById = new Map(products.map((p) => [p.productId, p]));

  const [lines, setLines] = useState<Line[]>(() => {
    const valid = preselected.filter((id) => productById.has(id));
    return valid.length > 0
      ? valid.map((id) => ({ key: lineKey++, productId: id, qty: suggestedQty(productById.get(id)) }))
      : [{ key: lineKey++, productId: "", qty: 1 }];
  });
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const fieldErrors = fieldErrorsOf(error);
  const suppliers = useApi(() => supplierService.list(), []);
  const chosen = new Set(lines.map((l) => l.productId));
  const totalQty = lines.reduce((sum, l) => sum + (l.productId === "" ? 0 : l.qty || 0), 0);

  const updateLine = (key: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    try {
      const po = await purchaseOrderService.create({
        supplierId: Number(data.get("supplierId")),
        expectedDate: String(data.get("expectedDate") ?? "") || undefined,
        note: String(data.get("note") ?? "").trim() || undefined,
        items: lines.filter((l) => l.productId !== "").map((l) => ({ productId: Number(l.productId), qty: l.qty })),
      });
      toast.success(`${po.code} created`);
      router.push(ROUTES.purchaseOrderDetail(po.id));
    } catch (err) {
      setError(err);
      setSaving(false);
    }
  };

  if (suppliers.error) return <ErrorState error={suppliers.error} onRetry={suppliers.reload} />;
  if (!suppliers.data) return <LoadingState />;

  return (
    <form className="flex flex-col gap-space-lg" onSubmit={submit} noValidate>
      {error ? <ErrorBanner error={error} onClose={() => setError(null)} /> : null}

      <section className={cn(CARD, "p-space-lg grid grid-cols-1 md:grid-cols-2 gap-space-md")}>
        <FormField label="Supplier" htmlFor="po-supplier" required error={fieldErrors.supplierId}>
          <Select id="po-supplier" name="supplierId">
            {suppliers.data.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
                {s.leadTimeDays != null ? ` (lead time ${s.leadTimeDays}d)` : ""}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Expected delivery" htmlFor="po-expected" error={fieldErrors.expectedDate}>
          <input id="po-expected" name="expectedDate" type="date" min={todayIso()} className={FORM_CONTROL_CLASS} />
        </FormField>
        <div className="md:col-span-2">
          <FormField label="Note" htmlFor="po-note" error={fieldErrors.note}>
            <textarea id="po-note" name="note" className={TEXTAREA_CLASS} />
          </FormField>
        </div>
      </section>

      <section className={cn(CARD, "p-space-lg flex flex-col gap-space-md")}>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Items</h2>
            {preselected.length > 0 && (
              <span className="font-label-sm text-label-sm text-secondary">
                Pre-filled from the low-stock list · qty = units needed to reach the minimum
              </span>
            )}
          </div>
          <button className={BUTTON.ghost} type="button" onClick={() => setLines((prev) => [...prev, { key: lineKey++, productId: "", qty: 1 }])}>
            <Icon name="add_circle" className="text-[18px]" />
            Add line
          </button>
        </div>
        {fieldErrors.items && <span className="font-label-sm text-label-sm text-error">{fieldErrors.items}</span>}
        <table className="w-full text-left">
          <thead>
            <tr className="text-secondary font-label-sm text-label-sm uppercase tracking-wider">
              <th className="py-2 pr-3">Product</th>
              <th className="py-2 px-3 w-28 text-right">Stock</th>
              <th className="py-2 px-3 w-28 text-right">Min</th>
              <th className="py-2 px-3 w-32 text-right">Order qty</th>
              <th className="py-2 w-10" />
            </tr>
          </thead>
          <tbody className="font-body-sm text-body-sm">
            {lines.map((line) => {
              const product = line.productId === "" ? undefined : productById.get(line.productId);
              return (
                <tr key={line.key}>
                  <td className="py-2 pr-3">
                    <Select
                      aria-label="Product"
                      value={line.productId}
                      onChange={(e) => {
                        const productId = e.target.value ? Number(e.target.value) : "";
                        updateLine(line.key, {
                          productId,
                          qty: productId === "" ? 1 : suggestedQty(productById.get(productId)),
                        });
                      }}
                    >
                      <option value="">Select product...</option>
                      {products
                        .filter((p) => p.active)
                        .map((p) => (
                          <option key={p.productId} value={p.productId} disabled={p.productId !== line.productId && chosen.has(p.productId)}>
                            {p.sku} — {p.name}
                          </option>
                        ))}
                    </Select>
                  </td>
                  <td className="py-2 px-3 text-right">
                    {product ? <StockStatusBadge status={product.status}>{product.stockQty}</StockStatusBadge> : "—"}
                  </td>
                  <td className="py-2 px-3 text-right font-data-mono text-secondary">{product?.minStock ?? "—"}</td>
                  <td className="py-2 px-3">
                    <input
                      aria-label="Quantity"
                      type="number"
                      min={1}
                      className={cn(FORM_CONTROL_CLASS, "text-right")}
                      value={line.qty}
                      onChange={(e) => updateLine(line.key, { qty: Math.max(0, Number(e.target.value)) })}
                    />
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      aria-label="Remove line"
                      className="p-2 rounded-lg text-secondary hover:text-error hover:bg-error-container/40 disabled:opacity-30"
                      disabled={lines.length === 1}
                      onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                    >
                      <Icon name="delete" className="text-[18px]" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex justify-end font-body-md text-body-md text-secondary">
          Total quantity: <b className="ml-1 text-on-surface font-data-mono">{totalQty}</b>
        </div>
      </section>

      <div className="flex items-center justify-end gap-space-sm">
        {!allowed && <RoleHint>Only {rolesFor("managePurchaseOrders")} can submit purchase orders</RoleHint>}
        <Link className={BUTTON.ghost} href={ROUTES.purchaseOrders}>
          Cancel
        </Link>
        <button className={BUTTON.primary} type="submit" disabled={!allowed || saving}>
          <Icon name="send" className="text-[18px]" />
          {saving ? "Submitting..." : "Submit PO"}
        </button>
      </div>
    </form>
  );
}

export function CreatePurchaseOrderPage() {
  const searchParams = useSearchParams();
  const preselected = (searchParams.get("productIds") ?? "")
    .split(",")
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
  // /inventory gives stock + shortage for the qty suggestion (readable by Warehouse and Manager).
  const { data: products, error, reload } = useApi(() => inventoryService.list(), []);

  return (
    <div className="p-margin max-w-[1100px] mx-auto w-full flex flex-col gap-space-lg">
      <nav className="flex items-center gap-space-xs text-secondary font-label-md text-label-md">
        <Link className="hover:text-primary" href={ROUTES.purchaseOrders}>
          Purchase Orders
        </Link>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="text-on-surface font-semibold">New</span>
      </nav>
      <PageHeader title="New Purchase Order" subtitle="Status starts as ORDERED; stock is added when you mark it received" />
      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !products ? (
        <LoadingState />
      ) : (
        // key: re-initialise the lines if the pre-selection changes
        <PurchaseOrderForm key={preselected.join(",")} products={products} preselected={preselected} />
      )}
    </div>
  );
}
