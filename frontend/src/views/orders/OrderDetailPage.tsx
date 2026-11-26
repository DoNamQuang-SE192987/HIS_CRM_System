"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ErrorBanner, ErrorState, LoadingState, RoleHint } from "@/components/common";
import { ChannelBadge } from "@/components/orders/ChannelBadge";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { BUTTON, CARD, Icon, TABLE_HEAD_ROW } from "@/components/ui";
import { ROUTES, can, rolesFor } from "@/constants";
import { useApi } from "@/hooks";
import type { OrderDetail } from "@/interfaces";
import { orderService } from "@/services";
import { toast, useAuthStore } from "@/stores";
import { cn, formatCurrency, formatDate, formatDateTime } from "@/utils";

function InfoTile({ label, children, hint }: { label: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="flex flex-col gap-space-xs p-space-md rounded-lg bg-surface-container-low/70 min-w-0">
      <span className="font-label-md text-label-md text-secondary">{label}</span>
      <div className="font-headline-sm text-headline-sm text-on-surface break-words">{children}</div>
      {hint && <span className="font-body-sm text-body-sm text-secondary">{hint}</span>}
    </div>
  );
}

function AddressBlock({ title, icon, name, address }: { title: string; icon: string; name: string; address: string | null }) {
  return (
    <div className="flex flex-col p-space-lg rounded-xl bg-surface-container-low/40">
      <div className="flex items-center gap-space-sm mb-space-sm">
        <Icon name={icon} className="text-[20px] text-primary" />
        <h3 className="font-headline-sm text-headline-sm text-on-surface">{title}</h3>
      </div>
      <p className="pl-7 font-body-md text-body-md font-semibold text-on-surface">{name}</p>
      <p className="pl-7 font-body-md text-body-md text-on-surface-variant whitespace-pre-line">{address ?? "—"}</p>
    </div>
  );
}

type Action = "ship" | "cancel" | "invoice";

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const id = Number(orderId);
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const { data: order, error, reload } = useApi(() => orderService.get(id), [id]);
  const [busy, setBusy] = useState<Action | null>(null);
  const [actionError, setActionError] = useState<unknown>(null);

  const run = async (action: Action, call: () => Promise<unknown>, success: string) => {
    setBusy(action);
    setActionError(null);
    try {
      await call();
      toast.success(success);
      reload();
    } catch (err) {
      setActionError(err);
    } finally {
      setBusy(null);
    }
  };

  const ship = (o: OrderDetail) => run("ship", () => orderService.ship(o.id), `${o.code} shipped — stock deducted`);

  const cancel = (o: OrderDetail) => {
    if (!window.confirm(`Cancel order ${o.code}? This cannot be undone.`)) return;
    run("cancel", () => orderService.cancel(o.id), `${o.code} canceled`);
  };

  const issueInvoice = async (o: OrderDetail) => {
    setBusy("invoice");
    setActionError(null);
    try {
      const invoice = await orderService.issueInvoice(o.id);
      toast.success(`Invoice ${invoice.invoiceNo} ready`);
      // this page stays alive (hidden) after navigating - don't leave the button busy for the way back
      setBusy(null);
      router.push(ROUTES.invoice(invoice.id));
    } catch (err) {
      setActionError(err);
      setBusy(null);
    }
  };

  if (error) {
    return (
      <div className="p-margin max-w-[1440px] mx-auto w-full">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }
  if (!order) return <LoadingState />;

  const isNew = order.status === "NEW";
  const shortLines = order.items.filter((item) => !item.enoughStock);
  const marketplace = order.channel !== "WHOLESALE";

  return (
    <div className="p-margin max-w-[1440px] mx-auto w-full flex flex-col gap-space-lg">
      {/* Breadcrumb, title & actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <nav className="flex items-center gap-space-xs text-secondary font-label-md text-label-md">
            <Link className="hover:text-primary transition-colors" href={ROUTES.orders}>
              Orders
            </Link>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-on-surface font-semibold">{order.code}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">Order {order.code}</h1>
            <OrderStatusBadge status={order.status} />
            {order.overdue && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                <Icon name="alarm" className="text-[14px]" />
                Overdue
              </span>
            )}
            <span className="flex items-center gap-1 font-body-sm text-body-sm text-secondary">
              <Icon name="schedule" className="text-[16px]" />
              Created {formatDateTime(order.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-space-sm">
          {order.invoice
            ? can(role, "viewInvoice") && (
                <Link href={ROUTES.invoice(order.invoice.id)} className={BUTTON.secondary}>
                  <Icon name="receipt_long" className="text-[18px]" />
                  Invoice {order.invoice.invoiceNo}
                </Link>
              )
            : order.status !== "CANCELED" &&
              can(role, "issueInvoice") && (
                <button className={BUTTON.secondary} type="button" disabled={busy !== null} onClick={() => issueInvoice(order)}>
                  <Icon name="receipt_long" className="text-[18px]" />
                  {busy === "invoice" ? "Creating..." : "Create Invoice"}
                </button>
              )}
          {isNew && can(role, "cancelOrder") && (
            <button className={BUTTON.danger} type="button" disabled={busy !== null} onClick={() => cancel(order)}>
              <Icon name="cancel" className="text-[18px]" />
              {busy === "cancel" ? "Canceling..." : "Cancel Order"}
            </button>
          )}
          {isNew &&
            (can(role, "shipOrder") ? (
              <button className={BUTTON.primary} type="button" disabled={busy !== null} onClick={() => ship(order)}>
                <Icon name="local_shipping" className="text-[18px]" />
                {busy === "ship" ? "Shipping..." : "Mark as Shipped"}
              </button>
            ) : (
              <RoleHint>Shipping: {rolesFor("shipOrder")} role</RoleHint>
            ))}
        </div>
      </div>

      <ErrorBanner error={actionError} onClose={() => setActionError(null)} />
      {isNew && shortLines.length > 0 && !actionError && (
        <div className="flex items-center gap-space-sm p-space-md rounded-xl bg-amber-50 text-amber-900 font-body-sm text-body-sm">
          <Icon name="inventory" className="text-[20px]" />
          Not enough stock to ship {shortLines.map((l) => l.sku).join(", ")} yet — receive a purchase order or stock-in first.
        </div>
      )}

      {/* Info */}
      <div className={cn(CARD, "p-space-lg flex flex-col gap-space-lg")}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <InfoTile label="Sales channel" hint={marketplace ? "Marketplace order" : "Wholesale on invoice"}>
            <ChannelBadge channel={order.channel} />
          </InfoTile>
          <InfoTile label="Marketplace order #">
            <span className="font-data-mono text-data-mono">{order.externalOrderNo ?? "—"}</span>
          </InfoTile>
          <InfoTile label="Billed to" hint={`Payment term: Net ${order.customer.paymentTermDays}`}>
            {order.customer.name}
          </InfoTile>
          <InfoTile
            label="Dates"
            hint={
              <>
                Ship by {formatDate(order.shipBy)}
                {order.shippedAt && ` · shipped ${formatDateTime(order.shippedAt)}`}
                {order.canceledAt && ` · canceled ${formatDateTime(order.canceledAt)}`}
              </>
            }
          >
            {formatDate(order.orderDate)}
          </InfoTile>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          <AddressBlock title="Ship To" icon="local_shipping" name={order.recipientName} address={order.shipTo} />
          <AddressBlock title="Bill To" icon="receipt" name={order.customer.name} address={order.billTo ?? order.shipTo} />
        </div>
        {order.note && (
          <p className="font-body-sm text-body-sm text-secondary">
            <b className="text-on-surface">Note:</b> {order.note}
          </p>
        )}
      </div>

      {/* Lines */}
      <div className={cn(CARD, "p-space-lg flex flex-col gap-space-md")}>
        <div className="flex items-center gap-space-sm">
          <Icon name="inventory_2" className="text-primary text-[22px]" />
          <h2 className="font-headline-md text-headline-md text-on-surface">Line Items</h2>
        </div>
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-left">
            <thead>
              <tr className={TABLE_HEAD_ROW}>
                <th className="py-3 px-4">SKU + Product</th>
                <th className="py-3 px-4 text-right">Qty</th>
                <th className="py-3 px-4 text-right">Unit price</th>
                <th className="py-3 px-4 text-right">Line total</th>
                {isNew && <th className="py-3 px-4 text-right">In stock</th>}
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-on-surface divide-y divide-surface-container-low">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-space-sm">
                      <span className="font-data-mono text-data-mono font-semibold text-primary px-2 py-0.5 bg-primary-fixed/20 rounded">
                        {item.sku}
                      </span>
                      <span className="font-semibold">
                        {item.productName}
                        {item.packSize && <span className="text-secondary font-normal"> ({item.packSize})</span>}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-data-mono text-data-mono">{item.qty}</td>
                  <td className="py-3 px-4 text-right font-data-mono text-data-mono text-secondary">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-3 px-4 text-right font-data-mono text-data-mono font-semibold">
                    {formatCurrency(item.lineTotal)}
                  </td>
                  {isNew && (
                    <td className="py-3 px-4 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 font-data-mono text-data-mono font-semibold",
                          item.enoughStock ? "text-primary" : "text-error",
                        )}
                        title={item.enoughStock ? "Enough stock" : `Missing ${item.qty - item.availableStock}`}
                      >
                        <Icon name={item.enoughStock ? "check_circle" : "error"} className="text-[16px]" />
                        {item.availableStock}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end">
          <div className="w-full sm:w-80 bg-surface-container-low/60 p-space-lg rounded-xl flex justify-between items-baseline">
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Total</span>
            <span className="font-headline-md text-headline-md font-bold font-data-mono">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
