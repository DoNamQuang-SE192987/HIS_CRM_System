import Link from "next/link";
import { ChannelBadge } from "@/components/orders/ChannelBadge";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Icon } from "@/components/ui";
import { ROUTES } from "@/constants";
import type { Order } from "@/interfaces";
import { formatCurrency } from "@/utils";

export function RecentOrdersCard({ orders }: { orders: Order[] }) {
  const total = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="xl:col-span-6 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="px-6 py-4 bg-surface-container-lowest flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Recent Orders
          </h2>
          <span className="font-label-sm text-label-sm text-secondary bg-surface-container px-2 py-0.5 rounded-full">
            {orders.length} latest
          </span>
        </div>
        <Link
          className="font-label-md text-label-md text-primary font-medium hover:underline flex items-center gap-1"
          href={ROUTES.orders}
        >
          View all orders
          <Icon name="arrow_forward" className="text-[16px]" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-secondary font-label-sm text-label-sm uppercase tracking-wider">
              <th className="py-3 px-6 font-semibold">Order #</th>
              <th className="py-3 px-3 font-semibold">Channel</th>
              <th className="py-3 px-4 font-semibold">Customer</th>
              <th className="py-3 px-4 font-semibold text-right">Total</th>
              <th className="py-3 px-6 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm text-on-surface">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-3.5 px-6 font-data-mono text-data-mono font-medium text-primary">
                  <Link href={ROUTES.orderDetail(order.id)} className="hover:underline">
                    {order.id}
                  </Link>
                </td>
                <td className="py-3.5 px-3">
                  <ChannelBadge channel={order.channel} variant="compact" />
                </td>
                <td className="py-3.5 px-4 font-medium truncate max-w-[170px]" title={order.customer}>
                  {order.customer}
                </td>
                <td className="py-3.5 px-4 font-data-mono text-data-mono text-right text-on-surface font-medium">
                  {formatCurrency(order.total)}
                </td>
                <td className="py-3.5 px-6 text-right">
                  <OrderStatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 bg-surface-container-low/40 flex items-center justify-between text-secondary font-label-sm text-label-sm">
        <span>Showing {orders.length} most recent sales orders</span>
        <span className="font-data-mono text-data-mono text-on-surface font-semibold">
          Total: {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
