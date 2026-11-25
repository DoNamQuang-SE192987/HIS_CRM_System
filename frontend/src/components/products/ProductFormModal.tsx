"use client";

import { useState, type FormEvent } from "react";
import { ErrorBanner } from "@/components/common";
import { BUTTON, FORM_CONTROL_CLASS, FormField, Modal, Select } from "@/components/ui";
import type { PriceUnit, Product, ProductPayload } from "@/interfaces";
import { productService } from "@/services";
import { toast } from "@/stores";
import { fieldErrorsOf } from "@/utils";

interface ProductFormModalProps {
  /** null = create, a product = edit. */
  product: Product | null;
  onClose: () => void;
  onSaved: (product: Product) => void;
}

/** Add / edit a catalogue product. Stock is only editable as the opening balance on create. */
export function ProductFormModal({ product, onClose, onSaved }: ProductFormModalProps) {
  const editing = product !== null;
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const fieldErrors = fieldErrorsOf(error);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim() || undefined;
    const payload: ProductPayload = {
      sku: String(data.get("sku") ?? "").trim(),
      name: String(data.get("name") ?? "").trim(),
      brand: text("brand"),
      packSize: text("packSize"),
      packDescription: text("packDescription"),
      unitsPerCarton: Number(data.get("unitsPerCarton")),
      price: Number(data.get("price")),
      priceUnit: String(data.get("priceUnit")) as PriceUnit,
      minStock: Number(data.get("minStock") || 0),
      imageUrl: text("imageUrl"),
    };

    setSaving(true);
    setError(null);
    try {
      const saved = editing
        ? await productService.update(product.id, payload)
        : await productService.create({ ...payload, stockQty: Number(data.get("stockQty") || 0) });
      toast.success(editing ? `Saved ${saved.sku}` : `Added ${saved.sku}`);
      onSaved(saved);
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
      size="lg"
      title={editing ? `Edit ${product.sku}` : "Add Product"}
      subtitle={editing ? "Stock is changed only through warehouse operations" : "New catalogue item"}
      icon={editing ? "edit" : "add"}
    >
      <form className="p-space-lg flex flex-col gap-space-md" onSubmit={handleSubmit} noValidate>
        {error && !Object.keys(fieldErrors).length ? <ErrorBanner error={error} /> : null}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
          <FormField label="SKU" htmlFor="p-sku" required error={fieldErrors.sku}>
            <input id="p-sku" name="sku" className={FORM_CONTROL_CLASS} defaultValue={product?.sku} required />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Product name" htmlFor="p-name" required error={fieldErrors.name}>
              <input id="p-name" name="name" className={FORM_CONTROL_CLASS} defaultValue={product?.name} required />
            </FormField>
          </div>
          <FormField label="Brand" htmlFor="p-brand" error={fieldErrors.brand}>
            <input id="p-brand" name="brand" className={FORM_CONTROL_CLASS} defaultValue={product?.brand ?? ""} />
          </FormField>
          <FormField label="Pack size" htmlFor="p-pack" hint="e.g. 500g x 12" error={fieldErrors.packSize}>
            <input id="p-pack" name="packSize" className={FORM_CONTROL_CLASS} defaultValue={product?.packSize ?? ""} />
          </FormField>
          <FormField label="Units per carton" htmlFor="p-units" required error={fieldErrors.unitsPerCarton}>
            <input
              id="p-units"
              name="unitsPerCarton"
              type="number"
              min={1}
              className={FORM_CONTROL_CLASS}
              defaultValue={product?.unitsPerCarton ?? 12}
              required
            />
          </FormField>
          <div className="sm:col-span-3">
            <FormField label="Pack description" htmlFor="p-desc" error={fieldErrors.packDescription}>
              <input
                id="p-desc"
                name="packDescription"
                className={FORM_CONTROL_CLASS}
                defaultValue={product?.packDescription ?? ""}
                placeholder="500G x 12 bags / carton"
              />
            </FormField>
          </div>
          <FormField label="Price (USD)" htmlFor="p-price" required error={fieldErrors.price}>
            <input
              id="p-price"
              name="price"
              type="number"
              step="0.01"
              min="0.01"
              className={FORM_CONTROL_CLASS}
              defaultValue={product?.price}
              required
            />
          </FormField>
          <FormField label="Sold per" htmlFor="p-unit" error={fieldErrors.priceUnit}>
            <Select id="p-unit" name="priceUnit" defaultValue={product?.priceUnit ?? "CARTON"}>
              <option value="CARTON">Carton</option>
              <option value="BAG">Bag</option>
            </Select>
          </FormField>
          <FormField label="Minimum stock" htmlFor="p-min" hint="Below this = LOW" error={fieldErrors.minStock}>
            <input
              id="p-min"
              name="minStock"
              type="number"
              min={0}
              className={FORM_CONTROL_CLASS}
              defaultValue={product?.minStock ?? 0}
            />
          </FormField>
          <div className="sm:col-span-2">
            <FormField label="Image URL" htmlFor="p-img" error={fieldErrors.imageUrl}>
              <input id="p-img" name="imageUrl" className={FORM_CONTROL_CLASS} defaultValue={product?.imageUrl ?? ""} />
            </FormField>
          </div>
          {editing ? (
            <FormField label="Stock on hand" htmlFor="p-stock" hint="Use Inventory → Stock In / Damaged">
              <input id="p-stock" className={FORM_CONTROL_CLASS} value={product.stockQty} disabled readOnly />
            </FormField>
          ) : (
            <FormField label="Opening stock" htmlFor="p-stock" hint="Booked as opening balance" error={fieldErrors.stockQty}>
              <input id="p-stock" name="stockQty" type="number" min={0} className={FORM_CONTROL_CLASS} defaultValue={0} />
            </FormField>
          )}
        </div>
        <div className="flex items-center justify-end gap-space-sm pt-space-sm">
          <button className={BUTTON.ghost} type="button" onClick={onClose}>
            Cancel
          </button>
          <button className={BUTTON.primary} type="submit" disabled={saving}>
            {saving ? "Saving..." : editing ? "Save changes" : "Add product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
