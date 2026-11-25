import { Icon } from "@/components/ui";
import { INVENTORY_STATUS_STYLES } from "@/constants";
import type { Product } from "@/interfaces";
import { cn, getProductLabel, getStockStatus } from "@/utils";

interface InventoryTableProps {
  products: Product[];
  totalCount: number;
}

export function InventoryTable({ products, totalCount }: InventoryTableProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low h-10 text-secondary font-label-md text-label-md uppercase tracking-wider">
              <th className="px-space-md w-28">SKU</th>
              <th className="px-space-md">Product Name</th>
              <th className="px-space-md text-right w-44">Stock on Hand</th>
              <th className="px-space-md text-right w-44">Minimum Stock</th>
              <th className="px-space-md w-36 text-center">Status</th>
              <th className="px-space-md text-right w-28">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm text-on-surface">
            {products.map((product) => {
              const status = getStockStatus(product);
              const style = INVENTORY_STATUS_STYLES[status];
              const isOut = status === "out_of_stock";

              return (
                <tr key={product.sku} className="hover:bg-surface-container-low/50 transition-colors h-12">
                  <td
                    className={cn(
                      "px-space-md font-data-mono text-data-mono font-medium",
                      isOut ? "text-error font-semibold" : "text-primary",
                    )}
                  >
                    {product.sku}
                  </td>
                  <td className="px-space-md font-medium text-on-surface">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full", style.dotClassName)} />
                      <span>{getProductLabel(product)}</span>
                    </div>
                  </td>
                  <td
                    className={cn(
                      "px-space-md text-right font-data-mono text-data-mono",
                      isOut ? "text-error font-bold" : "text-on-surface font-semibold",
                    )}
                  >
                    {product.stockOnHand} {product.stockUnit}
                  </td>
                  <td className="px-space-md text-right font-data-mono text-data-mono text-secondary">
                    {product.minStock} {product.stockUnit}
                  </td>
                  <td className="px-space-md text-center">
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold",
                        style.className,
                      )}
                    >
                      {style.label}
                    </span>
                  </td>
                  <td className="px-space-md text-right">
                    <button
                      className="text-secondary hover:text-primary p-1 rounded-lg hover:bg-surface-container-high transition-colors"
                      title="Adjust / Reorder"
                      type="button"
                    >
                      <Icon name="more_vert" className="text-[18px]" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-secondary">
                  No items match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-space-md py-space-sm bg-surface-container-lowest flex items-center justify-between text-secondary font-label-sm text-label-sm">
        <span>
          Showing {products.length} of {totalCount} items
        </span>
        <div className="flex items-center gap-space-xs">
          <button
            className="px-2 py-1 rounded bg-surface-container-low text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            disabled
          >
            Previous
          </button>
          <span className="px-2 py-1 bg-primary text-on-primary rounded font-semibold">1</span>
          <button
            className="px-2 py-1 rounded bg-surface-container-low text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            disabled
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
