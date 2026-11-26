import type { ReactNode } from "react";

/** Shared look for inputs/selects inside forms and modals. */
export const FORM_CONTROL_CLASS =
  "w-full h-[38px] px-3 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20";

export const TEXTAREA_CLASS =
  "w-full min-h-[72px] px-3 py-2 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
  /** Validation message from the API (fieldErrors[field]). */
  error?: string;
  hint?: string;
  /** Non-blocking advice shown in place of the hint (the form can still be submitted). */
  warning?: string;
  required?: boolean;
}

export function FormField({ label, htmlFor, children, error, hint, warning, required }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-label-md text-label-md text-on-surface" htmlFor={htmlFor}>
        {label}
        {required && <span className="text-error"> *</span>}
      </label>
      {children}
      {error ? (
        <span className="font-label-sm text-label-sm text-error">{error}</span>
      ) : warning ? (
        <span className="font-label-sm text-label-sm text-amber-800" role="status">
          {warning}
        </span>
      ) : (
        hint && <span className="font-label-sm text-label-sm text-secondary">{hint}</span>
      )}
    </div>
  );
}
