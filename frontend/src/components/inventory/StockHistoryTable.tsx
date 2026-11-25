import { Icon } from "@/components/ui";
import { STOCK_MOVEMENT_STYLES } from "@/constants";
import type { StockMovement } from "@/interfaces";
import { cn, formatDateTime, formatSignedNumber } from "@/utils";

export function StockHistoryTable({ movements }: { movements: StockMovement[] }) {
  return (
    <div className="flex flex-col gap-space-md">
      <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
            <Icon name="receipt_long" className="text-[18px]" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface">Recent Warehouse Audit Log</span>
            <span className="font-label-sm text-label-sm text-secondary">
              Chronological stock entries, dispatches, and shrinkage logs
            </span>
          </div>
        </div>
        <button
          className="h-8 px-space-sm rounded-lg bg-surface-container-low text-secondary hover:text-on-surface font-label-sm text-label-sm flex items-center gap-1 transition-colors"
          type="button"
        >
          <Icon name="file_download" className="text-[16px]" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low h-10 text-secondary font-label-md text-label-md uppercase tracking-wider">
                <th className="px-space-md">Date &amp; Time</th>
                <th className="px-space-md">Product</th>
                <th className="px-space-md text-center w-28">Type</th>
                <th className="px-space-md text-right w-36">Quantity</th>
                <th className="px-space-md w-36">Reference</th>
                <th className="px-space-md">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm text-on-surface">
              {movements.map((movement) => {
                const style = STOCK_MOVEMENT_STYLES[movement.type];
                return (
                  <tr key={movement.id} className="hover:bg-surface-container-low/50 transition-colors h-12">
                    <td className="px-space-md font-data-mono text-data-mono text-secondary">
                      {formatDateTime(movement.occurredAt)}
                    </td>
                    <td className="px-space-md font-medium text-on-surface">
                      {movement.sku} · {movement.productName}
                    </td>
                    <td className="px-space-md text-center">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold",
                          style.className,
                        )}
                      >
                        {movement.type}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "px-space-md text-right font-data-mono text-data-mono font-semibold",
                        style.quantityClassName,
                      )}
                    >
                      {formatSignedNumber(movement.quantity)} {movement.unit}
                    </td>
                    <td className="px-space-md font-data-mono text-data-mono text-secondary">
                      {movement.reference}
                    </td>
                    <td className="px-space-md">
                      {movement.user ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-surface-container-high text-primary font-bold text-[10px] flex items-center justify-center">
                            {movement.user.initials}
                          </span>
                          <span>{movement.user.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Icon name="smart_toy" className="text-secondary text-[16px]" />
                          <span className="text-secondary">Automated OMS</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
