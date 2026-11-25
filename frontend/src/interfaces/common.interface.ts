/** Business roles - sent to the API in the X-User-Role header. */
export type Role = "SALES" | "WAREHOUSE" | "MANAGER";

/** Paging envelope of every list endpoint. `page` is 1-based. */
export interface Page<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

/** Uniform error body returned by the backend. */
export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
  fieldErrors?: Record<string, string>;
  status: number;
  path: string;
  timestamp: string;
}

/** One line of an INSUFFICIENT_STOCK error. */
export interface StockShortage {
  sku: string;
  required: number;
  available: number;
}
