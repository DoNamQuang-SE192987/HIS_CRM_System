"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui";
import { ROLE_LABELS } from "@/constants";
import { ApiError } from "@/services/api-client";
import { useAuthStore } from "@/stores";
import { cn, errorMessage } from "@/utils";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-space-sm py-16 text-secondary font-body-md text-body-md">
      <Icon name="progress_activity" className="animate-spin text-[22px] text-primary" />
      {label}
    </div>
  );
}

/** Full-area error for a failed page load: explains 403 (wrong role) and unreachable backend. */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const role = useAuthStore((state) => state.role);
  const forbidden = error instanceof ApiError && error.status === 403;
  const network = error instanceof ApiError && error.status === 0;

  return (
    <div className="flex flex-col items-center justify-center text-center gap-space-sm py-16 px-space-lg bg-surface-container-lowest rounded-xl shadow-sm">
      <div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center",
          forbidden ? "bg-surface-container text-secondary" : "bg-error-container text-error",
        )}
      >
        <Icon name={forbidden ? "lock" : network ? "cloud_off" : "error"} className="text-[24px]" />
      </div>
      <h3 className="font-headline-sm text-headline-sm text-on-surface">
        {forbidden ? "Not available for your role" : network ? "Backend not reachable" : "Could not load data"}
      </h3>
      <p className="font-body-sm text-body-sm text-secondary max-w-md">
        {forbidden
          ? `The ${ROLE_LABELS[role].label} role cannot open this page. Switch role in the top bar.`
          : errorMessage(error)}
      </p>
      {onRetry && !forbidden && (
        <button
          className="mt-space-xs h-[34px] px-space-md rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-container-highest"
          type="button"
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  );
}

/** Inline error for a failed action (ship, save...). Lists stock shortages per SKU when present. */
export function ErrorBanner({ error, onClose }: { error: unknown; onClose?: () => void }) {
  if (!error) return null;
  const shortages = error instanceof ApiError ? error.shortages : [];

  return (
    <div role="alert" className="flex items-start gap-space-sm p-space-md rounded-xl bg-error-container/50 text-on-error-container">
      <Icon name="error" className="text-[20px] text-error mt-0.5" />
      <div className="flex-1 flex flex-col gap-space-xs">
        <span className="font-body-md text-body-md font-semibold">{errorMessage(error)}</span>
        {shortages.length > 0 && (
          <table className="w-full max-w-md text-left font-body-sm text-body-sm">
            <thead>
              <tr className="text-on-error-container/80">
                <th className="py-1 pr-4 font-semibold">SKU</th>
                <th className="py-1 pr-4 font-semibold text-right">Required</th>
                <th className="py-1 pr-4 font-semibold text-right">Available</th>
                <th className="py-1 font-semibold text-right">Missing</th>
              </tr>
            </thead>
            <tbody>
              {shortages.map((line) => (
                <tr key={line.sku}>
                  <td className="py-0.5 pr-4 font-data-mono">{line.sku}</td>
                  <td className="py-0.5 pr-4 text-right font-data-mono">{line.required}</td>
                  <td className="py-0.5 pr-4 text-right font-data-mono">{line.available}</td>
                  <td className="py-0.5 text-right font-data-mono font-bold text-error">
                    {line.required - line.available}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {onClose && (
        <button type="button" aria-label="Dismiss" className="text-on-error-container/70 hover:text-on-error-container" onClick={onClose}>
          <Icon name="close" className="text-[18px]" />
        </button>
      )}
    </div>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-10 text-center text-secondary font-body-sm text-body-sm">
        {children}
      </td>
    </tr>
  );
}

/** Small "not allowed for your role" hint shown next to disabled actions. */
export function RoleHint({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary">
      <Icon name="lock" className="text-[14px]" />
      {children}
    </span>
  );
}
