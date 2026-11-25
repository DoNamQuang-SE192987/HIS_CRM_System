import Link from "next/link";
import { Badge, Icon } from "@/components/ui";
import { ROUTES } from "@/constants";
import type { Product } from "@/interfaces";
import { abbreviateUnit } from "@/utils";

interface LowStockAlertCardProps {
  products: Product[];
  supplierLeadTimeDays: number;
}

export function LowStockAlertCard({ products, supplierLeadTimeDays }: LowStockAlertCardProps) {
  return (
    <div className="xl:col-span-6 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="px-6 py-4 bg-surface-container-lowest flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-error" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Low Stock Alert
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
            {products.length} items
          </span>
        </div>
        <span className="font-label-sm text-label-sm text-secondary">Below reorder minimum</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-secondary font-label-sm text-label-sm uppercase tracking-wider">
              <th className="py-3 px-6 font-semibold">Product &amp; SKU</th>
              <th className="py-3 px-3 font-semibold text-right">Current</th>
              <th className="py-3 px-3 font-semibold text-right">Min</th>
              <th className="py-3 px-3 font-semibold text-center">Status</th>
              <th className="py-3 px-6 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm text-on-surface">
            {products.map((product) => (
              <tr key={product.sku} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-3.5 px-6">
                  <div className="flex flex-col">
                    <span className="font-body-md text-body-md font-medium text-on-surface">
                      {product.name}
                    </span>
                    <span className="font-label-sm text-label-sm text-secondary">
                      SKU: {product.sku} · {product.packSize}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-3 text-right">
                  <span className="font-data-mono text-data-mono font-semibold text-error">
                    {product.stockOnHand}
                  </span>
                  <span className="text-secondary text-[11px] block">
                    {abbreviateUnit(product.stockUnit)}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-right">
                  <span className="font-data-mono text-data-mono text-secondary">
                    {product.minStock}
                  </span>
                  <span className="text-secondary text-[11px] block">
                    {abbreviateUnit(product.stockUnit)}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-center">
                  <Badge className="px-2 bg-error-container text-on-error-container">Low Stock</Badge>
                </td>
                <td className="py-3.5 px-6 text-right">
                  <Link
                    href={ROUTES.purchaseOrders}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container text-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container hover:text-on-primary transition-colors"
                  >
                    <Icon name="add" className="text-[14px]" />
                    Create PO
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-surface-container-low/40 flex items-center justify-between text-secondary font-label-sm text-label-sm">
        <span>
          Supplier lead time avg: <strong>{supplierLeadTimeDays} business days</strong>
        </span>
        <Link
          className="text-primary font-medium hover:underline flex items-center gap-1"
          href={ROUTES.purchaseOrders}
        >
          Open PO Replenishment
          <Icon name="arrow_forward" className="text-[14px]" />
        </Link>
      </div>
    </div>
  );
}
