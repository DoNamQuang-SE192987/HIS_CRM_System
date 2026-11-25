"use client";

import { useState, type FormEvent } from "react";
import { ErrorBanner } from "@/components/common";
import { BUTTON, FORM_CONTROL_CLASS, FormField, Modal, Select } from "@/components/ui";
import type { InventoryItem } from "@/interfaces";
import { inventoryService } from "@/services";
import { toast } from "@/stores";
import { fieldErrorsOf } from "@/utils";

interface StockInModalProps {
  products: InventoryItem[];
  onClose: () => void;
  onDone: () => void;
}

/** Manual receipt without a purchase order (returns, found stock...). PO receipts use "Mark as Received". */
export function StockInModal({ products, onClose, onDone }: StockInModalProps) {
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const fieldErrors = fieldErrorsOf(error);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    try {
      const tx = await inventoryService.stockIn({
        productId: Number(data.get("productId")),
        qty: Number(data.get("qty")),
        note: String(data.get("note") ?? "").trim() || undefined,
      });
      toast.success(`+${tx.quantity} ${tx.sku} — stock now ${tx.balanceAfter}`);
      onDone();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Manual Stock In" subtitle="Recorded as IN · MANUAL in the stock ledger" icon="add_circle">
      <form className="p-space-lg flex flex-col gap-space-md" onSubmit={submit} noValidate>
        {error && !Object.keys(fieldErrors).length ? <ErrorBanner error={error} /> : null}
        <FormField label="Product" htmlFor="in-product" required error={fieldErrors.productId}>
          <Select id="in-product" name="productId">
            {products.map((p) => (
              <option key={p.productId} value={p.productId}>
                {p.sku} — {p.name} (now {p.stockQty})
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Quantity received" htmlFor="in-qty" required error={fieldErrors.qty}>
          <input id="in-qty" name="qty" type="number" min={1} className={FORM_CONTROL_CLASS} placeholder="e.g. 20" />
        </FormField>
        <FormField label="Note" htmlFor="in-note" hint="Why there is no PO: customer return, recount..." error={fieldErrors.note}>
          <input id="in-note" name="note" className={FORM_CONTROL_CLASS} />
        </FormField>
        <div className="flex justify-end gap-space-sm pt-space-sm">
          <button className={BUTTON.ghost} type="button" onClick={onClose}>
            Cancel
          </button>
          <button className={BUTTON.primary} type="submit" disabled={saving}>
            {saving ? "Saving..." : "Confirm stock in"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
