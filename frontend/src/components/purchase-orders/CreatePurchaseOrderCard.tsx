"use client";

import { useState } from "react";
import { Icon } from "@/components/ui";
import type { PurchaseOrderDraft, Supplier } from "@/interfaces";
import { formatCurrency } from "@/utils";

const FIELD_CLASS =
  "w-full h-[38px] px-3 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container transition-colors";

interface CreatePurchaseOrderCardProps {
  draft: PurchaseOrderDraft;
  suppliers: Supplier[];
}

export function CreatePurchaseOrderCard({ draft, suppliers }: CreatePurchaseOrderCardProps) {
  const [supplierId, setSupplierId] = useState(draft.supplierId);
  const [deliveryDate, setDeliveryDate] = useState(draft.expectedDeliveryDate);
  const lines = draft.lines;

  const totalCartons = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0);
  const total = subtotal + draft.receivingSurcharge;

  return (
    <div className="bg-surface-container-lowest shadow-md rounded-xl p-space-lg flex flex-col gap-space-lg">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container" />
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">
              New Entry
            </span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">Create Purchase Order</h2>
          <p className="font-body-sm text-body-sm text-secondary">Add items to replenish low-stock food inventory</p>
        </div>
        <span className="font-data-mono text-label-sm px-2 py-1 rounded bg-surface-container text-on-surface font-semibold">
          {draft.id}
        </span>
      </div>

      {/* Supplier & delivery date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-label-sm text-on-surface font-medium" htmlFor="po-supplier">
            Supplier Selector
          </label>
          <div className="relative flex items-center">
            <select
              id="po-supplier"
              className={`${FIELD_CLASS} appearance-none cursor-pointer`}
              value={supplierId}
              onChange={(event) => setSupplierId(event.target.value)}
            >
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            <Icon name="expand_more" className="absolute right-2 text-secondary text-[20px] pointer-events-none" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-label-sm text-label-sm text-on-surface font-medium" htmlFor="po-delivery">
            Expected Delivery Date
          </label>
          <div className="relative flex items-center">
            <input
              id="po-delivery"
              className={FIELD_CLASS}
              type="date"
              value={deliveryDate}
              onChange={(event) => setDeliveryDate(event.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Product lines */}
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">Product Lines</span>
          <button
            className="inline-flex items-center gap-1 font-label-md text-label-md text-primary hover:text-primary-container transition-colors"
            type="button"
          >
            <Icon name="add_circle" className="text-[16px]" />
            Add Line
          </button>
        </div>
        <div className="bg-surface-container-low rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/60 h-8">
                <th className="px-3 font-label-sm text-label-sm text-secondary">Product Item</th>
                <th className="px-2 font-label-sm text-label-sm text-secondary text-right">Qty</th>
                <th className="px-2 font-label-sm text-label-sm text-secondary text-right">Unit Cost</th>
                <th className="px-3 font-label-sm text-label-sm text-secondary text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.sku} className="h-12 hover:bg-surface-container-high/40 transition-colors">
                  <td className="px-3 py-2">
                    <div className="flex flex-col min-w-0">
                      <span className="font-body-sm text-body-sm text-on-surface font-semibold truncate">
                        {line.productName}
                      </span>
                      <span className="font-data-mono text-[11px] text-secondary">{line.sku}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2 text-right">
                    <span className="font-body-sm text-body-sm text-on-surface tabular-nums">{line.quantity} ct</span>
                  </td>
                  <td className="px-2 py-2 text-right">
                    <span className="font-data-mono text-body-sm text-secondary tabular-nums">
                      {formatCurrency(line.unitCost)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <span className="font-data-mono text-body-sm text-on-surface font-semibold tabular-nums">
                      {formatCurrency(line.quantity * line.unitCost)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-surface-container-low/70 rounded-xl p-space-md flex flex-col gap-space-xs">
        <div className="flex items-center justify-between text-secondary">
          <span className="font-body-sm text-body-sm">Subtotal ({totalCartons} Cartons)</span>
          <span className="font-data-mono text-body-sm tabular-nums">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-secondary">
          <span className="font-body-sm text-body-sm">Inbound Receiving Surcharge</span>
          <span className="font-data-mono text-body-sm tabular-nums">{formatCurrency(draft.receivingSurcharge)}</span>
        </div>
        <div className="h-px bg-surface-container my-1" />
        <div className="flex items-center justify-between pt-1">
          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">PO Total</span>
          <span className="font-headline-md text-headline-md text-primary font-bold font-data-mono tabular-nums">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-space-sm pt-2">
        <div className="grid grid-cols-2 gap-space-sm">
          <button
            className="h-[38px] px-space-md rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-label-md shadow-sm transition-colors flex items-center justify-center"
            type="button"
          >
            Save as Draft
          </button>
          <button
            className="h-[38px] px-space-md rounded-lg bg-surface-container hover:bg-surface-container-high text-primary-container font-label-md text-label-md transition-colors flex items-center justify-center gap-1 font-semibold"
            type="button"
          >
            <Icon name="send" className="text-[16px]" />
            Submit PO
          </button>
        </div>
        <button
          className="w-full h-11 px-space-lg rounded-lg bg-primary-container hover:bg-primary text-on-primary font-body-md text-body-md font-semibold shadow-md transition-all flex items-center justify-center gap-space-sm"
          type="button"
        >
          <Icon name="assignment_turned_in" className="text-[20px]" />
          Mark as Received
        </button>
        <p className="font-label-sm text-label-sm text-secondary text-center">
          Adds stock to inventory automatically upon confirmation
        </p>
      </div>
    </div>
  );
}
