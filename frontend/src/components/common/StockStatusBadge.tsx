import { STOCK_STATUS_STYLES } from "@/constants";
import type { StockStatus } from "@/interfaces";
import { cn } from "@/utils";

export function StockStatusBadge({ status, children }: { status: StockStatus; children?: React.ReactNode }) {
  const style = STOCK_STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap",
        style.className,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", style.dotClassName)} />
      {children ?? style.label}
    </span>
  );
}
