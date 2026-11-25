import { Fragment } from "react";
import { Icon } from "@/components/ui";
import { APP_NAME, COMPANY } from "@/constants";
import type { Address, InvoiceInfo, OrderDetail } from "@/interfaces";
import { addDays, formatCurrency, formatDate, getOrderSubtotal } from "@/utils";

function InvoiceAddress({ label, icon, address }: { label: string; icon: string; address: Address }) {
  return (
    <div className="bg-surface rounded-lg p-space-md flex flex-col">
      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider mb-space-xs flex items-center gap-1">
        <Icon name={icon} className="text-xs" />
        {label}
      </span>
      <div className="font-headline-sm text-body-lg text-on-surface font-semibold">{address.name}</div>
      <div className="font-body-md text-body-md text-on-surface-variant mt-1 leading-relaxed">
        {[address.attention && `Attn: ${address.attention}`, ...address.lines]
          .filter(Boolean)
          .map((line, index) => (
            <Fragment key={index}>
              {index > 0 && <br />}
              {line}
            </Fragment>
          ))}
      </div>
    </div>
  );
}

interface InvoiceDocumentProps {
  order: OrderDetail;
  invoice: InvoiceInfo;
}

export function InvoiceDocument({ order, invoice }: InvoiceDocumentProps) {
  const total = getOrderSubtotal(order);
  const dueDate = addDays(invoice.invoiceDate, invoice.paymentTermDays);

  return (
    <div className="w-full bg-surface-container-low print:bg-surface-container-lowest py-space-xl print:py-0 px-space-md flex justify-center">
      <div className="w-full max-w-4xl bg-surface-container-lowest rounded-lg shadow-md print:shadow-none p-12 print:p-0 flex flex-col gap-space-xl">
        {/* Letterhead */}
        <div className="flex flex-row justify-between items-start">
          <div className="flex flex-col gap-space-xs max-w-md">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-headline-sm text-headline-sm">
                L
              </div>
              <span className="font-headline-md text-headline-md text-on-surface tracking-tight">{APP_NAME}</span>
            </div>
            <p className="font-label-md text-label-md text-secondary uppercase tracking-wider">{COMPANY.legalName}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs leading-relaxed">
              {COMPANY.address}
              <br />
              Tel: {COMPANY.phone} • {COMPANY.email}
            </p>
          </div>
          <div className="text-right flex flex-col items-end">
            <span className="font-headline-xl text-headline-xl text-primary font-bold tracking-tight">INVOICE</span>
            <div className="mt-space-sm px-space-sm py-1 bg-surface-container rounded font-data-mono text-label-sm text-primary">
              ORIGINAL
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="bg-surface-container-low rounded-lg p-space-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Invoice #</span>
              <span className="font-data-mono text-body-md text-on-surface font-semibold mt-1">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Order #</span>
              <span className="font-data-mono text-body-md text-on-surface font-semibold mt-1">{order.id}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Invoice Date</span>
              <span className="font-body-md text-body-md text-on-surface font-medium mt-1">
                {formatDate(invoice.invoiceDate, "long")}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Payment Terms</span>
              <span className="font-body-md text-body-md text-primary font-medium mt-1">
                Net {invoice.paymentTermDays} ({formatDate(dueDate)})
              </span>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          <InvoiceAddress label="Bill To" icon="receipt_long" address={order.billTo} />
          <InvoiceAddress label="Ship To" icon="local_shipping" address={order.shipTo} />
        </div>

        {/* Line items */}
        <div className="flex flex-col overflow-hidden rounded-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container font-label-md text-label-md text-secondary">
                <th className="py-space-sm px-space-md w-16 text-center" scope="col">Qty</th>
                <th className="py-space-sm px-space-md w-28" scope="col">Item #</th>
                <th className="py-space-sm px-space-md" scope="col">Description</th>
                <th className="py-space-sm px-space-md text-right w-28" scope="col">Unit Price</th>
                <th className="py-space-sm px-space-md text-right w-32" scope="col">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low font-body-md text-body-md text-on-surface">
              {order.items.map((item) => (
                <tr key={item.sku} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-space-md px-space-md font-data-mono text-center">{item.quantity}</td>
                  <td className="py-space-md px-space-md font-data-mono text-secondary">{item.sku}</td>
                  <td className="py-space-md px-space-md font-medium">
                    {item.productName} ({item.packSize} / carton)
                  </td>
                  <td className="py-space-md px-space-md font-data-mono text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-space-md px-space-md font-data-mono text-right font-semibold">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-end pt-space-xs">
          <div className="w-full max-w-xs flex flex-col gap-space-xs bg-surface-container-low p-space-md rounded-lg">
            <div className="flex justify-between items-baseline font-headline-sm text-headline-sm text-on-surface pt-space-xs">
              <span className="font-bold">Total</span>
              <span className="font-data-mono text-headline-md font-bold text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-space-lg pt-space-md bg-surface-container-low/60 rounded-lg p-space-md text-center">
          <p className="font-body-md text-body-md text-secondary">
            Thank you for your business! Please remit payment within {invoice.paymentTermDays} days.
          </p>
        </div>
      </div>
    </div>
  );
}
