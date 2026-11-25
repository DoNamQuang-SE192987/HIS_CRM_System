"use client";

import type { FormEvent } from "react";
import { FORM_CONTROL_CLASS, FormField, Modal } from "@/components/ui";
import type { Product, StockInPayload } from "@/interfaces";
import { getProductLabel } from "@/utils";

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSubmit: (payload: StockInPayload) => void;
}

export function StockInModal({ isOpen, onClose, products, onSubmit }: StockInModalProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit({
      sku: String(data.get("sku")),
      quantity: Number(data.get("quantity")),
      poReference: String(data.get("poReference")),
      notes: String(data.get("notes") ?? "") || undefined,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stock In Replenishment"
      subtitle="Register arrived wholesale stock to inventory"
      icon="add_circle"
    >
      <form className="p-space-lg flex flex-col gap-space-md" onSubmit={handleSubmit}>
        <FormField label="Select Product SKU" htmlFor="stockin-sku">
          <select id="stockin-sku" name="sku" className={FORM_CONTROL_CLASS}>
            {products.map((product) => (
              <option key={product.sku} value={product.sku}>
                {product.sku} — {getProductLabel(product)}
              </option>
            ))}
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-space-md">
          <FormField label="Quantity In (Units/Cartons)" htmlFor="stockin-qty">
            <input
              id="stockin-qty"
              name="quantity"
              className={FORM_CONTROL_CLASS}
              min={1}
              placeholder="e.g. 50"
              required
              type="number"
            />
          </FormField>
          <FormField label="Reference PO #" htmlFor="stockin-po">
            <input
              id="stockin-po"
              name="poReference"
              className={FORM_CONTROL_CLASS}
              placeholder="PO-2025-XXXX"
              required
              type="text"
            />
          </FormField>
        </div>
        <FormField label="Receiving Notes (Optional)" htmlFor="stockin-notes">
          <input
            id="stockin-notes"
            name="notes"
            className={FORM_CONTROL_CLASS}
            placeholder="Batch / Expiry tag or bay location"
            type="text"
          />
        </FormField>
        <div className="flex items-center justify-end gap-space-sm pt-space-md">
          <button
            className="h-[38px] px-space-md rounded-lg text-secondary hover:text-on-surface font-label-md text-label-md"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="h-[38px] px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:opacity-95 transition-opacity"
            type="submit"
          >
            Confirm Stock In
          </button>
        </div>
      </form>
    </Modal>
  );
}
