/** Shared button looks (Tailwind class strings) so every screen stays consistent. */
const BASE =
  "inline-flex items-center justify-center gap-space-xs h-[38px] px-4 rounded-lg font-label-md text-label-md transition-colors disabled:opacity-50 disabled:pointer-events-none";

export const BUTTON = {
  primary: `${BASE} bg-primary-container text-on-primary hover:bg-primary shadow-sm`,
  secondary: `${BASE} bg-surface-container-lowest text-on-surface hover:bg-surface-container-low shadow-sm`,
  ghost: `${BASE} text-secondary hover:text-on-surface hover:bg-surface-container-low`,
  danger: `${BASE} bg-error-container/40 text-error hover:bg-error-container/80`,
  dangerSolid: `${BASE} bg-error text-on-error hover:opacity-95`,
  /** Compact button for table rows. */
  row: "inline-flex items-center gap-1 px-3 py-1 rounded-lg font-label-md text-label-md transition-colors disabled:opacity-50 disabled:pointer-events-none",
} as const;

export const SELECT_CLASS =
  "h-[38px] pl-3 pr-8 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none appearance-none cursor-pointer";

export const CARD = "bg-surface-container-lowest rounded-xl shadow-sm";

export const TABLE_HEAD_ROW =
  "bg-surface-container-low text-secondary font-label-sm text-label-sm uppercase tracking-wider";
