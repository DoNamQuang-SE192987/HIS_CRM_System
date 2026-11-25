import { Badge, Icon } from "@/components/ui";
import { PURCHASE_ORDER_STATUS_STYLES } from "@/constants";
import type { PurchaseOrder, Supplier } from "@/interfaces";
import { cn, formatCurrency, formatDate } from "@/utils";

function RowAction({ po }: { po: PurchaseOrder }) {
  if (po.status === "draft") {
    return (
      <button
        className="inline-flex items-center px-space-md py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm transition-colors"
        type="button"
      >
        Edit
      </button>
    );
  }
  if (po.status === "ordered") {
    return (
      <button
        className="inline-flex items-center gap-1 px-space-md py-1 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-body-sm text-body-sm font-medium shadow-sm transition-all"
        type="button"
      >
        <Icon name="check_circle" className="text-[16px]" />
        Mark as Received
      </button>
    );
  }
  return (
    <button
      className="inline-flex items-center px-space-md py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-secondary hover:text-on-surface font-body-sm text-body-sm transition-colors"
      type="button"
    >
      View
    </button>
  );
}

interface PurchaseOrdersTableProps {
  purchaseOrders: PurchaseOrder[];
  suppliersById: Map<string, Supplier>;
  totalCount: number;
}

export function PurchaseOrdersTable({ purchaseOrders, suppliersById, totalCount }: PurchaseOrdersTableProps) {
  return (
    <div className="bg-surface-container-lowest shadow-sm rounded-xl overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low h-10">
              {["PO #", "Supplier", "Date", "Status"].map((heading) => (
                <th key={heading} className="px-space-md font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                  {heading}
                </th>
              ))}
              <th className="px-space-md font-label-sm text-label-sm text-secondary uppercase tracking-wider text-right">
                Total Amount
              </th>
              <th className="px-space-md font-label-sm text-label-sm text-secondary uppercase tracking-wider text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrders.map((po) => {
              const supplier = suppliersById.get(po.supplierId);
              const status = PURCHASE_ORDER_STATUS_STYLES[po.status];
              return (
                <tr
                  key={po.id}
                  className={cn(
                    "h-14 hover:bg-surface-container-low transition-colors group",
                    po.status === "ordered" && "bg-surface-container-low/40",
                  )}
                >
                  <td className="px-space-md font-data-mono text-body-sm text-on-surface font-semibold">{po.id}</td>
                  <td className="px-space-md">
                    <div className="flex flex-col min-w-[140px]">
                      <span className="font-body-md text-body-md text-on-surface font-medium truncate">
                        {supplier?.name ?? "Unknown supplier"}
                      </span>
                      <span className="font-label-sm text-label-sm text-secondary">{supplier?.description}</span>
                    </div>
                  </td>
                  <td className="px-space-md font-body-sm text-body-sm text-secondary whitespace-nowrap">
                    {formatDate(po.orderDate)}
                  </td>
                  <td className="px-space-md">
                    <Badge className={status.className}>{status.label}</Badge>
                  </td>
                  <td className="px-space-md font-data-mono text-body-md text-on-surface text-right font-medium tabular-nums">
                    {formatCurrency(po.total)}
                  </td>
                  <td className="px-space-md text-right">
                    <RowAction po={po} />
                  </td>
                </tr>
              );
            })}
            {purchaseOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-secondary font-body-sm text-body-sm">
                  No purchase orders match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-space-md py-space-sm bg-surface-container-low flex items-center justify-between text-secondary">
        <span className="font-label-sm text-label-sm">
          Showing {purchaseOrders.length} of {totalCount} records
        </span>
        <div className="flex items-center gap-space-xs">
          <button
            className="p-1 rounded bg-surface-container hover:bg-surface-container-high transition-colors disabled:opacity-50"
            type="button"
            disabled
            aria-label="Previous page"
          >
            <Icon name="chevron_left" className="text-[16px]" />
          </button>
          <span className="font-data-mono text-label-sm px-2">1 / 1</span>
          <button
            className="p-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors disabled:opacity-50"
            type="button"
            disabled
            aria-label="Next page"
          >
            <Icon name="chevron_right" className="text-[16px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
