"use client";

import { useState, type FormEvent } from "react";
import { ErrorBanner } from "@/components/common";
import { BUTTON, FORM_CONTROL_CLASS, FormField, Modal, Select } from "@/components/ui";
import { DAMAGE_REASONS } from "@/constants";
import type { InventoryItem } from "@/interfaces";
import { inventoryService } from "@/services";
import { toast } from "@/stores";
import { fieldErrorsOf } from "@/utils";

interface DamagedStockModalProps {
  products: InventoryItem[];
  onClose: () => void;
  onDone: () => void;
}

/** Write off broken / expired goods (hàng huỷ). Cannot exceed current stock. */
export function DamagedStockModal({ products, onClose, onDone }: DamagedStockModalProps) {
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const [reason, setReason] = useState("");
  const fieldErrors = fieldErrorsOf(error);
  // Only products that still have something to write off.
  const selectable = products.filter((p) => p.stockQty > 0);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    try {
      const tx = await inventoryService.recordDamaged({
        productId: Number(data.get("productId")),
        qty: Number(data.get("qty")),
        reason: reason.trim(),
      });
      toast.success(`${tx.quantity} ${tx.sku} written off — stock now ${tx.balanceAfter}`);
      onDone();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Record Damaged Goods"
      subtitle="Recorded as DAMAGED in the stock ledger"
      icon="warning"
      iconClassName="bg-error text-on-error"
      headerClassName="bg-error-container/30"
    >
      <form className="p-space-lg flex flex-col gap-space-md" onSubmit={submit} noValidate>
        {error && !Object.keys(fieldErrors).length ? <ErrorBanner error={error} /> : null}
        <FormField label="Product" htmlFor="dmg-product" required error={fieldErrors.productId}>
          <Select id="dmg-product" name="productId">
            {selectable.map((p) => (
              <option key={p.productId} value={p.productId}>
                {p.sku} — {p.name} (in stock {p.stockQty})
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Quantity damaged" htmlFor="dmg-qty" required error={fieldErrors.qty}>
          <input id="dmg-qty" name="qty" type="number" min={1} className={FORM_CONTROL_CLASS} placeholder="e.g. 2" />
        </FormField>
        <FormField label="Reason" htmlFor="dmg-reason" required error={fieldErrors.reason}>
          <input
            id="dmg-reason"
            className={FORM_CONTROL_CLASS}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Vỡ chai, hết hạn..."
          />
        </FormField>
        <div className="flex flex-wrap gap-space-xs -mt-space-xs">
          {DAMAGE_REASONS.map((item) => (
            <button
              key={item}
              type="button"
              className="px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high font-label-sm text-label-sm text-on-surface"
              onClick={() => setReason(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-space-sm pt-space-sm">
          <button className={BUTTON.ghost} type="button" onClick={onClose}>
            Cancel
          </button>
          <button className={BUTTON.dangerSolid} type="submit" disabled={saving || selectable.length === 0}>
            {saving ? "Saving..." : "Write off stock"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
