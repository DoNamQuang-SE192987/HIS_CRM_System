import Link from "next/link";
import { EmptyRow } from "@/components/common";
import { TABLE_HEAD_ROW } from "@/components/ui";
import { ROUTES } from "@/constants";
import type { OrderSummary } from "@/interfaces";
import { cn, daysOverdue, formatCurrency, formatDate } from "@/utils";
import { ChannelBadge } from "./ChannelBadge";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrdersMiniTableProps {
  orders: OrderSummary[];
  /** "overdue" shows ship-by + days late instead of total. */
  variant?: "recent" | "overdue";
  emptyText: string;
}

/** Compact order table used on the dashboard. */
export function OrdersMiniTable({ orders, variant = "recent", emptyText }: OrdersMiniTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className={TABLE_HEAD_ROW}>
            <th className="py-3 px-6 font-semibold">Order #</th>
            <th className="py-3 px-3 font-semibold">Channel</th>
            <th className="py-3 px-4 font-semibold">Customer</th>
            {variant === "overdue" ? (
              <th className="py-3 px-6 font-semibold text-right">Ship by</th>
            ) : (
              <>
                <th className="py-3 px-4 font-semibold text-right">Total</th>
                <th className="py-3 px-6 font-semibold text-right">Status</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm text-on-surface">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-surface-container-low/50 transition-colors">
              <td className="py-3 px-6 font-data-mono text-data-mono font-medium text-primary">
                <Link href={ROUTES.orderDetail(order.id)} className="hover:underline">
                  {order.code}
                </Link>
              </td>
              <td className="py-3 px-3">
                <ChannelBadge channel={order.channel} variant="compact" />
              </td>
              <td className="py-3 px-4 font-medium truncate max-w-[180px]" title={order.recipientName}>
                {order.channel === "WHOLESALE" ? order.customerName : order.recipientName}
              </td>
              {variant === "overdue" ? (
                <td className="py-3 px-6 text-right">
                  <span className="font-data-mono text-data-mono">{formatDate(order.shipBy)}</span>
                  <span className="block font-label-sm text-label-sm text-error font-semibold">
                    {daysOverdue(order.shipBy)} day(s) late
                  </span>
                </td>
              ) : (
                <>
                  <td
                    className={cn(
                      "py-3 px-4 font-data-mono text-data-mono text-right font-medium",
                      order.status === "CANCELED" && "line-through text-secondary",
                    )}
                  >
                    {formatCurrency(order.total)}
                  </td>
                  <td className="py-3 px-6 text-right">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </>
              )}
            </tr>
          ))}
          {orders.length === 0 && <EmptyRow colSpan={variant === "overdue" ? 4 : 5}>{emptyText}</EmptyRow>}
        </tbody>
      </table>
    </div>
  );
}
