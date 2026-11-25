const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const wholeCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/**
 * Dates from the API are either ISO dates ("2026-11-26", business date) or instants ("2026-11-26T09:15:00Z").
 * Business dates are rendered in UTC so "2026-11-26" never shifts to the previous day.
 */
const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** Instants are shown in the viewer's local time. */
const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

/** 3420 → "$3,420.00" */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** 148920 → "$148,920" */
export function formatCurrencyWhole(value: number): string {
  return wholeCurrencyFormatter.format(value);
}

/** "2026-11-26" → "Nov 26, 2026" ("long" → "November 26, 2026"); null → "—" */
export function formatDate(iso: string | null | undefined, style: "short" | "long" = "short"): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return style === "long" ? longDateFormatter.format(date) : shortDateFormatter.format(date);
}

/** "2026-11-26T09:15:00Z" → "Nov 26, 2026, 04:15 PM" (local time) */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return dateTimeFormatter.format(new Date(iso));
}

/** 150 → "+150", -2 → "-2" */
export function formatSignedNumber(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

/** Today as yyyy-MM-dd in local time (for <input type="date"> defaults / limits). */
export function todayIso(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/** Whole days between a past ISO date and today (0 if not in the past). */
export function daysOverdue(iso: string | null): number {
  if (!iso) return 0;
  const diff = Date.parse(todayIso()) - Date.parse(iso);
  return Math.max(0, Math.round(diff / 86_400_000));
}
