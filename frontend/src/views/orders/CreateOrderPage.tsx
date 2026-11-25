"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ErrorBanner, ErrorState, LoadingState, PageHeader, RoleHint } from "@/components/common";
import { NewCustomerModal } from "@/components/orders/NewCustomerModal";
import { BUTTON, CARD, FORM_CONTROL_CLASS, FormField, Icon, Select, TEXTAREA_CLASS } from "@/components/ui";
import { ROUTES, SALES_CHANNEL_STYLES, SALES_CHANNELS, can, rolesFor } from "@/constants";
import { useApi } from "@/hooks";
import type { OrderCreatePayload, SalesChannel } from "@/interfaces";
import { customerService, orderService, productService } from "@/services";
import { toast, useAuthStore } from "@/stores";
import { cn, fieldErrorsOf, formatCurrency } from "@/utils";

interface Line {
  key: number;
  productId: number | "";
  qty: number;
}

let lineKey = 1;
const newLine = (): Line => ({ key: lineKey++, productId: "", qty: 1 });

export function CreateOrderPage() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const allowed = can(role, "createOrder");

  const [channel, setChannel] = useState<SalesChannel>("WHOLESALE");
  const [customerId, setCustomerId] = useState<number | "">("");
  const [lines, setLines] = useState<Line[]>(() => [newLine()]);
  const [addingCustomer, setAddingCustomer] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const fieldErrors = fieldErrorsOf(error);
  const marketplace = channel !== "WHOLESALE";

  const products = useApi(() => productService.list({ active: true, size: 100 }), []);
  const customers = useApi(() => customerService.list("WHOLESALE"), []);

  const productById = new Map((products.data?.items ?? []).map((p) => [p.id, p]));
  const customer = customers.data?.find((c) => c.id === customerId);
  const total = lines.reduce((sum, line) => {
    const product = line.productId === "" ? undefined : productById.get(line.productId);
    return sum + (product ? product.price * (line.qty || 0) : 0);
  }, 0);
  const chosen = new Set(lines.map((l) => l.productId));

  const updateLine = (key: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim() || undefined;
    const payload: OrderCreatePayload = {
      channel,
      customerId: marketplace ? undefined : customerId || undefined,
      externalOrderNo: marketplace ? text("externalOrderNo") : undefined,
      recipientName: text("recipientName"),
      shipTo: text("shipTo"),
      billTo: text("billTo"),
      shipBy: text("shipBy"),
      note: text("note"),
      items: lines
        .filter((l) => l.productId !== "")
        .map((l) => ({ productId: Number(l.productId), qty: l.qty })),
    };

    setSaving(true);
    setError(null);
    try {
      const order = await orderService.create(payload);
      toast.success(`Order ${order.code} created`);
      router.push(ROUTES.orderDetail(order.id));
    } catch (err) {
      setError(err);
      setSaving(false);
    }
  };

  const loadError = products.error ?? customers.error;

  return (
    <div className="p-margin max-w-[1200px] mx-auto w-full flex flex-col gap-space-lg">
      <nav className="flex items-center gap-space-xs text-secondary font-label-md text-label-md">
        <Link className="hover:text-primary" href={ROUTES.orders}>
          Orders
        </Link>
        <Icon name="chevron_right" className="text-[14px]" />
        <span className="text-on-surface font-semibold">New order</span>
      </nav>
      <PageHeader title="New Sales Order" subtitle="Prices are taken from the catalogue when the order is saved" />

      {loadError ? (
        <ErrorState error={loadError} />
      ) : !products.data || !customers.data ? (
        <LoadingState />
      ) : (
        <form className="flex flex-col gap-space-lg" onSubmit={submit} noValidate>
          {error ? <ErrorBanner error={error} onClose={() => setError(null)} /> : null}

          {/* Channel + customer */}
          <section className={cn(CARD, "p-space-lg flex flex-col gap-space-md")}>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Channel &amp; customer</h2>
            <div className="flex flex-wrap gap-space-sm" role="radiogroup" aria-label="Sales channel">
              {SALES_CHANNELS.map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={channel === value}
                  className={cn(
                    "inline-flex items-center gap-space-xs px-space-md h-[38px] rounded-lg font-label-md text-label-md transition-colors",
                    channel === value
                      ? "bg-primary-container text-on-primary"
                      : "bg-surface-container-low text-on-surface hover:bg-surface-container-high",
                  )}
                  onClick={() => setChannel(value)}
                >
                  <Icon name={SALES_CHANNEL_STYLES[value].icon} className="text-[18px]" />
                  {SALES_CHANNEL_STYLES[value].label}
                </button>
              ))}
            </div>

            {marketplace ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <FormField
                  label={`${SALES_CHANNEL_STYLES[channel].label} order #`}
                  htmlFor="o-ext"
                  required
                  error={fieldErrors.externalOrderNo}
                  hint="Billed to the shared marketplace account"
                >
                  <input id="o-ext" name="externalOrderNo" className={FORM_CONTROL_CLASS} placeholder="200013751032753" />
                </FormField>
                <FormField label="Recipient (buyer)" htmlFor="o-recipient" required error={fieldErrors.recipientName}>
                  <input id="o-recipient" name="recipientName" className={FORM_CONTROL_CLASS} placeholder="Elizabeth Lopez" />
                </FormField>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md items-end">
                <FormField label="Wholesale customer" htmlFor="o-customer" required error={fieldErrors.customerId}>
                  <Select
                    id="o-customer"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value ? Number(e.target.value) : "")}
                  >
                    <option value="">Select a customer...</option>
                    {customers.data.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <div className="flex items-center gap-space-sm h-[38px]">
                  {can(role, "manageCustomers") && (
                    <button className={BUTTON.ghost} type="button" onClick={() => setAddingCustomer(true)}>
                      <Icon name="person_add" className="text-[18px]" />
                      New customer
                    </button>
                  )}
                  {customer && (
                    <span className="font-label-sm text-label-sm text-secondary">
                      Net {customer.paymentTermDays} · {customer.phone ?? "no phone"}
                    </span>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Shipping */}
          <section className={cn(CARD, "p-space-lg grid grid-cols-1 md:grid-cols-2 gap-space-md")}>
            <h2 className="md:col-span-2 font-headline-sm text-headline-sm text-on-surface">Shipping</h2>
            <FormField
              label="Ship to"
              htmlFor="o-shipto"
              required={marketplace}
              error={fieldErrors.shipTo}
              hint={marketplace ? undefined : "Empty = customer address"}
            >
              <input
                id="o-shipto"
                name="shipTo"
                className={FORM_CONTROL_CLASS}
                placeholder={marketplace ? "12002 Fairpoint Dr, Houston, TX 77099" : (customer?.address ?? "")}
              />
            </FormField>
            <FormField label="Bill to" htmlFor="o-billto" error={fieldErrors.billTo} hint={marketplace ? "Optional" : "Empty = customer address"}>
              <input id="o-billto" name="billTo" className={FORM_CONTROL_CLASS} placeholder={marketplace ? "" : (customer?.address ?? "")} />
            </FormField>
            <FormField label="Ship by" htmlFor="o-shipby" error={fieldErrors.shipBy} hint="Marketplace SLA - drives the overdue flag">
              <input id="o-shipby" name="shipBy" type="date" className={FORM_CONTROL_CLASS} />
            </FormField>
            {!marketplace && (
              <FormField label="Recipient" htmlFor="o-recipient-w" error={fieldErrors.recipientName} hint="Empty = customer name">
                <input id="o-recipient-w" name="recipientName" className={FORM_CONTROL_CLASS} />
              </FormField>
            )}
            <div className="md:col-span-2">
              <FormField label="Note" htmlFor="o-note" error={fieldErrors.note}>
                <textarea id="o-note" name="note" className={TEXTAREA_CLASS} />
              </FormField>
            </div>
          </section>

          {/* Lines */}
          <section className={cn(CARD, "p-space-lg flex flex-col gap-space-md")}>
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Items</h2>
              <button className={BUTTON.ghost} type="button" onClick={() => setLines((prev) => [...prev, newLine()])}>
                <Icon name="add_circle" className="text-[18px]" />
                Add line
              </button>
            </div>
            {fieldErrors.items && <span className="font-label-sm text-label-sm text-error">{fieldErrors.items}</span>}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-secondary font-label-sm text-label-sm uppercase tracking-wider">
                    <th className="py-2 pr-3">Product</th>
                    <th className="py-2 px-3 w-28 text-right">Qty</th>
                    <th className="py-2 px-3 w-32 text-right">Unit price</th>
                    <th className="py-2 px-3 w-32 text-right">Line total</th>
                    <th className="py-2 w-10" />
                  </tr>
                </thead>
                <tbody className="font-body-sm text-body-sm">
                  {lines.map((line) => {
                    const product = line.productId === "" ? undefined : productById.get(line.productId);
                    const short = product && line.qty > product.stockQty;
                    return (
                      <tr key={line.key} className="align-top">
                        <td className="py-2 pr-3">
                          <Select
                            aria-label="Product"
                            value={line.productId}
                            onChange={(e) => updateLine(line.key, { productId: e.target.value ? Number(e.target.value) : "" })}
                          >
                            <option value="">Select product...</option>
                            {products.data!.items.map((p) => (
                              <option key={p.id} value={p.id} disabled={p.id !== line.productId && chosen.has(p.id)}>
                                {p.sku} — {p.name} ({p.stockQty} in stock)
                              </option>
                            ))}
                          </Select>
                          {short && (
                            <span className="mt-1 inline-flex items-center gap-1 font-label-sm text-label-sm text-amber-800">
                              <Icon name="warning" className="text-[14px]" />
                              Only {product.stockQty} in stock — the order can be saved but cannot ship yet
                            </span>
                          )}
                        </td>
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
                        <td className="py-2 px-3 text-right font-data-mono text-data-mono text-secondary leading-[38px]">
                          {product ? formatCurrency(product.price) : "—"}
                        </td>
                        <td className="py-2 px-3 text-right font-data-mono text-data-mono font-semibold leading-[38px]">
                          {product ? formatCurrency(product.price * (line.qty || 0)) : "—"}
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
            </div>
            <div className="flex justify-end">
              <div className="w-full sm:w-80 bg-surface-container-low/60 p-space-md rounded-xl flex justify-between items-baseline">
                <span className="font-headline-sm text-headline-sm text-on-surface">Total</span>
                <span className="font-headline-md text-headline-md font-bold font-data-mono text-primary">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-space-sm">
            {!allowed && <RoleHint>Only {rolesFor("createOrder")} can create orders</RoleHint>}
            <Link className={BUTTON.ghost} href={ROUTES.orders}>
              Cancel
            </Link>
            <button className={BUTTON.primary} type="submit" disabled={!allowed || saving}>
              <Icon name="check" className="text-[18px]" />
              {saving ? "Saving..." : "Create order"}
            </button>
          </div>
        </form>
      )}

      {addingCustomer && (
        <NewCustomerModal
          onClose={() => setAddingCustomer(false)}
          onCreated={(created) => {
            setAddingCustomer(false);
            customers.reload();
            setCustomerId(created.id);
          }}
        />
      )}
    </div>
  );
}
