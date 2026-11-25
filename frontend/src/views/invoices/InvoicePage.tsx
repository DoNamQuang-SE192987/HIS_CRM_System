"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ErrorState, LoadingState } from "@/components/common";
import { BUTTON, Icon } from "@/components/ui";
import { APP_NAME, ROUTES, SALES_CHANNEL_STYLES } from "@/constants";
import { useApi } from "@/hooks";
import { invoiceService } from "@/services";
import { cn, formatCurrency, formatDate } from "@/utils";

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">{label}</span>
      <span className="font-body-md text-body-md text-on-surface font-semibold mt-1">{children}</span>
    </div>
  );
}

function PartyBlock({ label, icon, name, address }: { label: string; icon: string; name: string; address: string }) {
  return (
    <div className="bg-surface print:bg-transparent print:border print:border-outline-variant rounded-lg p-space-md flex flex-col">
      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mb-space-xs flex items-center gap-1">
        <Icon name={icon} className="text-xs" />
        {label}
      </span>
      <span className="font-body-lg text-on-surface font-semibold">{name}</span>
      <span className="font-body-md text-body-md text-on-surface-variant mt-1 whitespace-pre-line">{address}</span>
    </div>
  );
}

export function InvoicePage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const id = Number(invoiceId);
  const { data: invoice, error, reload } = useApi(() => invoiceService.get(id), [id]);

  if (error) {
    return (
      <div className="p-margin max-w-4xl mx-auto w-full">
        <ErrorState error={error} onRetry={reload} />
      </div>
    );
  }
  if (!invoice) return <LoadingState />;

  return (
    <div className="flex flex-col">
      {/* Toolbar - never printed */}
      <div className="print:hidden sticky top-16 z-30 bg-surface-container-low/95 backdrop-blur px-margin py-space-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-space-md">
          <Link
            className="inline-flex items-center gap-space-xs font-label-md text-label-md text-secondary hover:text-primary"
            href={ROUTES.orderDetail(invoice.orderId)}
          >
            <Icon name="arrow_back" className="text-sm" />
            Back to order {invoice.orderCode}
          </Link>
          <button className={BUTTON.primary} type="button" onClick={() => window.print()}>
            <Icon name="print" className="text-[18px]" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="w-full bg-surface-container-low print:bg-white py-space-xl print:py-0 px-space-md print:px-0 flex justify-center">
        <article className="relative w-full max-w-4xl bg-surface-container-lowest rounded-lg shadow-md print:shadow-none print:rounded-none p-12 print:p-0 flex flex-col gap-space-xl overflow-hidden">
          {invoice.voided && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="-rotate-[25deg] text-[140px] font-black text-error/15 tracking-widest select-none">VOID</span>
            </div>
          )}

          {/* Letterhead */}
          <header className="flex flex-row justify-between items-start gap-space-lg">
            <div className="flex flex-col gap-space-xs max-w-md">
              <div className="flex items-center gap-space-xs">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-headline-sm text-headline-sm print:border print:border-primary">
                  L
                </div>
                <span className="font-headline-md text-headline-md text-on-surface tracking-tight">{APP_NAME}</span>
              </div>
              <p className="font-label-md text-label-md text-secondary uppercase tracking-wider">{invoice.company.name}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {invoice.company.address}
                <br />
                Tel: {invoice.company.phone} • {invoice.company.email}
              </p>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">INVOICE</span>
              <span
                className={cn(
                  "mt-space-sm px-space-sm py-1 rounded font-data-mono text-label-sm",
                  invoice.voided ? "bg-error-container text-error" : "bg-surface-container text-primary",
                )}
              >
                {invoice.voided ? "VOID — ORDER CANCELED" : "ORIGINAL"}
              </span>
            </div>
          </header>

          {/* Meta */}
          <section className="bg-surface-container-low print:bg-transparent print:border print:border-outline-variant rounded-lg p-space-md grid grid-cols-2 md:grid-cols-4 gap-space-md">
            <Meta label="Invoice #">
              <span className="font-data-mono">{invoice.invoiceNo}</span>
            </Meta>
            <Meta label="Order #">
              <span className="font-data-mono">{invoice.orderCode}</span>
              {invoice.externalOrderNo && (
                <span className="block font-label-sm text-label-sm text-secondary font-normal">
                  {SALES_CHANNEL_STYLES[invoice.channel].label} #{invoice.externalOrderNo}
                </span>
              )}
            </Meta>
            <Meta label="Invoice date">{formatDate(invoice.invoiceDate, "long")}</Meta>
            <Meta label="Payment terms">
              {invoice.paymentTermDays > 0 ? `Net ${invoice.paymentTermDays}` : "Due on receipt"}
              <span className="block font-label-sm text-label-sm text-secondary font-normal">
                Due {formatDate(invoice.dueDate)}
              </span>
            </Meta>
          </section>

          {/* Parties */}
          <section className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-space-lg">
            <PartyBlock label="Bill To" icon="receipt_long" name={invoice.customerName} address={invoice.billTo} />
            <PartyBlock label="Ship To" icon="local_shipping" name={invoice.recipientName} address={invoice.shipTo} />
          </section>

          {/* Lines */}
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container print:bg-transparent print:border-b-2 print:border-on-surface font-label-md text-label-md text-secondary">
                <th className="py-space-sm px-space-md w-16 text-center">Qty</th>
                <th className="py-space-sm px-space-md w-28">Item #</th>
                <th className="py-space-sm px-space-md">Description</th>
                <th className="py-space-sm px-space-md text-right w-28">Unit Price</th>
                <th className="py-space-sm px-space-md text-right w-32">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low font-body-md text-body-md text-on-surface">
              {invoice.lines.map((line) => (
                <tr key={line.lineNo}>
                  <td className="py-space-md px-space-md font-data-mono text-center">{line.qty}</td>
                  <td className="py-space-md px-space-md font-data-mono text-secondary">{line.sku}</td>
                  <td className="py-space-md px-space-md font-medium">
                    {line.description}
                    {line.packSize && <span className="text-secondary font-normal"> ({line.packSize})</span>}
                  </td>
                  <td className="py-space-md px-space-md font-data-mono text-right">{formatCurrency(line.unitPrice)}</td>
                  <td className="py-space-md px-space-md font-data-mono text-right font-semibold">
                    {formatCurrency(line.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-full max-w-xs flex justify-between items-baseline bg-surface-container-low print:bg-transparent print:border-t-2 print:border-on-surface p-space-md rounded-lg print:rounded-none">
              <span className="font-headline-sm text-headline-sm font-bold">Total ({invoice.currency})</span>
              <span className="font-data-mono text-headline-md font-bold text-primary">{formatCurrency(invoice.total)}</span>
            </div>
          </div>

          <footer className="pt-space-md text-center font-body-sm text-body-sm text-secondary">
            Thank you for your business!
            {invoice.paymentTermDays > 0 && ` Please remit payment by ${formatDate(invoice.dueDate, "long")}.`}
          </footer>
        </article>
      </div>
    </div>
  );
}
