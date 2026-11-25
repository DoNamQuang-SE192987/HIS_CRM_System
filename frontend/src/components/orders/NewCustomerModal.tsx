"use client";

import { useState, type FormEvent } from "react";
import { ErrorBanner } from "@/components/common";
import { BUTTON, FORM_CONTROL_CLASS, FormField, Modal } from "@/components/ui";
import type { Customer } from "@/interfaces";
import { customerService } from "@/services";
import { toast } from "@/stores";
import { fieldErrorsOf } from "@/utils";

interface NewCustomerModalProps {
  onClose: () => void;
  onCreated: (customer: Customer) => void;
}

/** Quick-create a wholesale customer without leaving the order form. */
export function NewCustomerModal({ onClose, onCreated }: NewCustomerModalProps) {
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const fieldErrors = fieldErrorsOf(error);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim() || undefined;
    setSaving(true);
    setError(null);
    try {
      const customer = await customerService.create({
        name: String(data.get("name") ?? "").trim(),
        phone: text("phone"),
        email: text("email"),
        address: text("address"),
        paymentTermDays: Number(data.get("paymentTermDays") || 0),
      });
      toast.success(`Customer ${customer.name} created`);
      onCreated(customer);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="New Wholesale Customer" subtitle="Business that buys on invoice" icon="person_add">
      <form className="p-space-lg flex flex-col gap-space-md" onSubmit={submit} noValidate>
        {error && !Object.keys(fieldErrors).length ? <ErrorBanner error={error} /> : null}
        <FormField label="Company name" htmlFor="c-name" required error={fieldErrors.name}>
          <input id="c-name" name="name" className={FORM_CONTROL_CLASS} required />
        </FormField>
        <div className="grid grid-cols-2 gap-space-md">
          <FormField label="Phone" htmlFor="c-phone" error={fieldErrors.phone}>
            <input id="c-phone" name="phone" className={FORM_CONTROL_CLASS} />
          </FormField>
          <FormField label="Email" htmlFor="c-email" error={fieldErrors.email}>
            <input id="c-email" name="email" type="email" className={FORM_CONTROL_CLASS} />
          </FormField>
        </div>
        <FormField label="Address" htmlFor="c-address" hint="Default ship-to / bill-to" error={fieldErrors.address}>
          <input id="c-address" name="address" className={FORM_CONTROL_CLASS} />
        </FormField>
        <FormField label="Payment term (days)" htmlFor="c-term" hint="30 = Net 30" error={fieldErrors.paymentTermDays}>
          <input id="c-term" name="paymentTermDays" type="number" min={0} max={365} defaultValue={30} className={FORM_CONTROL_CLASS} />
        </FormField>
        <div className="flex justify-end gap-space-sm">
          <button className={BUTTON.ghost} type="button" onClick={onClose}>
            Cancel
          </button>
          <button className={BUTTON.primary} type="submit" disabled={saving}>
            {saving ? "Saving..." : "Create customer"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
