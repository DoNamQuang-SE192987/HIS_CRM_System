import type { ApiErrorBody, StockShortage } from "@/interfaces";
import { useAuthStore } from "@/stores/auth.store";

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

/** Error thrown for every non-2xx response (and for network failures, with status 0). */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;
  readonly fieldErrors?: Record<string, string>;

  constructor(status: number, body: Partial<ApiErrorBody>) {
    super(body.message ?? `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code ?? "UNKNOWN";
    this.details = body.details;
    this.fieldErrors = body.fieldErrors;
  }

  /** Per-SKU shortages of an INSUFFICIENT_STOCK error. */
  get shortages(): StockShortage[] {
    return this.code === "INSUFFICIENT_STOCK" && Array.isArray(this.details) ? (this.details as StockShortage[]) : [];
  }
}

type QueryValue = string | number | boolean | undefined | null;

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH";
  query?: Record<string, QueryValue>;
  body?: unknown;
  formData?: FormData;
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  });
  const qs = params.toString();
  return `${API_BASE_URL}${path}${qs ? `?${qs}` : ""}`;
}

/** Thin fetch wrapper: adds the role header, JSON (or multipart) body, and turns errors into ApiError. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "X-User-Role": useAuthStore.getState().role };
  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, options.query), { method: options.method ?? "GET", headers, body });
  } catch {
    throw new ApiError(0, {
      code: "NETWORK_ERROR",
      message: `Cannot reach the API at ${API_BASE_URL}. Is the backend running?`,
    });
  }

  const text = await response.text();
  const data = text ? safeJson(text) : undefined;
  if (!response.ok) {
    throw new ApiError(response.status, (data as Partial<ApiErrorBody>) ?? {});
  }
  return data as T;
}

/** Fetches a non-JSON resource (e.g. the CSV template) as text. */
export async function apiText(path: string): Promise<string> {
  const response = await fetch(buildUrl(path), { headers: { "X-User-Role": useAuthStore.getState().role } });
  if (!response.ok) throw new ApiError(response.status, {});
  return response.text();
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}
