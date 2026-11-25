"use client";

import type { FormEvent } from "react";
import { FORM_CONTROL_CLASS, FormField, Modal } from "@/components/ui";
import { DAMAGE_CAUSES } from "@/constants";
import type { DamagedStockPayload, Product } from "@/interfaces";
import { getProductLabel, getStockStatus } from "@/utils";

interface DamagedStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSubmit: (payload: DamagedStockPayload) => void;
}

export function DamagedStockModal({ isOpen, onClose, products, onSubmit }: DamagedStockModalProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSubmit({
      sku: String(data.get("sku")),
      quantity: Number(data.get("quantity")),
      reference: String(data.get("reference")),
      cause: String(data.get("cause")),
    });
    onClose();
  };

  // Damage can only be recorded against products that still have stock.
  const selectableProducts = products.filter((product) => getStockStatus(product) !== "out_of_stock");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Damaged / Spoiled Stock"
      subtitle="Logs shrinkage and writes down inventory on hand"
      icon="warning"
      iconClassName="bg-error text-on-error"
      headerClassName="bg-error-container/30"
    >
      <form className="p-space-lg flex flex-col gap-space-md" onSubmit={handleSubmit}>
        <FormField label="Affected Product SKU" htmlFor="damaged-sku">
          <select id="damaged-sku" name="sku" className={FORM_CONTROL_CLASS}>
            {selectableProducts.map((product) => (
              <option key={product.sku} value={product.sku}>
                {product.sku} — {getProductLabel(product)}
              </option>
            ))}
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-space-md">
          <FormField label="Quantity Damaged" htmlFor="damaged-qty">
            <input
              id="damaged-qty"
              name="quantity"
              className={FORM_CONTROL_CLASS}
              min={1}
              placeholder="e.g. 2"
              required
              type="number"
            />
          </FormField>
          <FormField label="Damage Reference #" htmlFor="damaged-ref">
            <input
              id="damaged-ref"
              name="reference"
              className={FORM_CONTROL_CLASS}
              placeholder="REF-DMG-XXXX"
              required
              type="text"
            />
          </FormField>
        </div>
        <FormField label="Cause / Incident Details" htmlFor="damaged-cause">
          <select id="damaged-cause" name="cause" className={FORM_CONTROL_CLASS}>
            {DAMAGE_CAUSES.map((cause) => (
              <option key={cause}>{cause}</option>
            ))}
          </select>
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
            className="h-[38px] px-space-md rounded-lg bg-error text-on-error font-label-md text-label-md hover:opacity-95 transition-opacity"
            type="submit"
          >
            Log Damaged Stock
          </button>
        </div>
      </form>
    </Modal>
  );
}
