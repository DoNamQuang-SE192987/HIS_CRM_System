"use client";

import { Icon } from "@/components/ui";
import { useToastStore } from "@/stores";
import { cn } from "@/utils";

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div className="fixed bottom-space-lg right-space-lg z-[60] flex flex-col gap-space-sm print:hidden" aria-live="polite">
      {toasts.map((item) => (
        <div
          key={item.id}
          className={cn(
            "flex items-center gap-space-sm min-w-[280px] max-w-sm px-space-md py-space-sm rounded-lg shadow-lg font-body-sm text-body-sm",
            item.kind === "success" ? "bg-inverse-surface text-inverse-on-surface" : "bg-error text-on-error",
          )}
        >
          <Icon name={item.kind === "success" ? "check_circle" : "error"} className="text-[18px]" />
          <span className="flex-1">{item.message}</span>
          <button type="button" aria-label="Dismiss" onClick={() => dismiss(item.id)}>
            <Icon name="close" className="text-[16px] opacity-80" />
          </button>
        </div>
      ))}
    </div>
  );
}
