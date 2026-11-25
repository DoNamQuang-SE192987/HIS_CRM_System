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
 * Dates are stored as ISO strings and always rendered in UTC so that the
 * server render and the client hydration produce identical markup.
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

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
  timeZone: "UTC",
});

/** 3420 → "$3,420.00" */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** 148920 → "$148,920" */
export function formatCurrencyWhole(value: number): string {
  return wholeCurrencyFormatter.format(value);
}

/** "2025-10-24" → "Oct 24, 2025" ("long" → "October 24, 2025") */
export function formatDate(iso: string, style: "short" | "long" = "short"): string {
  const date = new Date(iso);
  return style === "long" ? longDateFormatter.format(date) : shortDateFormatter.format(date);
}

/** "2025-10-24T09:15:00Z" → "Oct 24, 2025 · 09:15 AM" */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return `${shortDateFormatter.format(date)} · ${timeFormatter.format(date)}`;
}

export function addDays(iso: string, days: number): string {
  const date = new Date(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

/** 150 → "+150", -2 → "-2" */
export function formatSignedNumber(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}
