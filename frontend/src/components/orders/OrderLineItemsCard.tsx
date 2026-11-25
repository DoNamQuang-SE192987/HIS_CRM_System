import { Icon } from "@/components/ui";
import type { OrderDetail } from "@/interfaces";
import { formatCurrency, getOrderSubtotal } from "@/utils";

export function OrderLineItemsCard({ order }: { order: OrderDetail }) {
  const subtotal = getOrderSubtotal(order);

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden p-space-lg flex flex-col gap-space-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <Icon name="inventory_2" className="text-primary text-[22px]" />
          <h2 className="font-headline-md text-headline-md text-on-surface">Order Line Items</h2>
        </div>
        <span className="font-label-md text-label-md text-secondary">
          {order.items.length} Line Items Total
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low text-secondary font-label-md text-label-md uppercase tracking-wider">
              <th className="py-3 px-4" scope="col">SKU + Product Name</th>
              <th className="py-3 px-4 text-center" scope="col">Quantity (Cartons)</th>
              <th className="py-3 px-4 text-right" scope="col">Unit Price ($/carton)</th>
              <th className="py-3 px-4 text-right" scope="col">Line Total ($USD)</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md text-on-surface">
            {order.items.map((item) => (
              <tr key={item.sku} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-space-sm">
                    <span className="font-data-mono text-data-mono font-semibold text-primary px-2 py-0.5 bg-primary-fixed/20 rounded">
                      {item.sku}
                    </span>
                    <span className="font-semibold text-on-surface">
                      {item.productName} ({item.packSize})
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-center font-data-mono text-data-mono font-medium">
                  {item.quantity} cartons
                </td>
                <td className="py-4 px-4 text-right font-data-mono text-data-mono text-secondary">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="py-4 px-4 text-right font-data-mono text-data-mono font-semibold text-on-surface">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-space-md">
        <div className="w-full sm:w-80 bg-surface-container-low/60 p-space-lg rounded-xl flex flex-col gap-space-sm">
          <div className="flex justify-between items-center text-secondary font-body-md text-body-md">
            <span>Subtotal</span>
            <span className="font-data-mono text-data-mono font-medium text-on-surface">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="h-0.5 bg-surface-container rounded-full my-space-xs" />
          <div className="flex justify-between items-baseline">
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Grand Total</span>
            <span className="font-headline-md text-headline-md font-bold text-on-surface font-data-mono">
              {formatCurrency(subtotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
