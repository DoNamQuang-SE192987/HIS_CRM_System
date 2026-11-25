import type { ReactNode } from "react";

/** Shared look for inputs/selects inside forms and modals. */
export const FORM_CONTROL_CLASS =
  "h-[38px] px-3 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-label-md text-label-md text-on-surface" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}
