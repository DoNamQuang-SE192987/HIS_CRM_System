import Link from "next/link";
import { Icon } from "@/components/ui";
import { ROUTES } from "@/constants";
import type { Order } from "@/interfaces";
import { cn, formatCurrency, formatDate } from "@/utils";
import { ChannelBadge } from "./ChannelBadge";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrdersTableRowProps {
  order: Order;
  selected: boolean;
  onToggleSelect: () => void;
}

export function OrdersTableRow({ order, selected, onToggleSelect }: OrdersTableRowProps) {
  const canceled = order.status === "canceled";

  return (
    <tr className="hover:bg-surface-container-low/60 transition-colors">
      <td className="py-3.5 px-space-md text-center">
        <input
          className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer accent-primary"
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          aria-label={`Select ${order.id}`}
        />
      </td>
      <td className="py-3.5 px-space-md">
        <div className="flex flex-col">
          <span
            className={cn(
              "font-data-mono text-data-mono font-semibold",
              canceled ? "text-secondary line-through" : "text-primary",
            )}
          >
            {order.id}
          </span>
          <span
            className={cn("font-label-sm text-label-sm", canceled ? "text-error" : "text-secondary")}
          >
            {order.reference}
          </span>
        </div>
      </td>
      <td className="py-3.5 px-space-md">
        <ChannelBadge channel={order.channel} />
      </td>
      <td className="py-3.5 px-space-md font-medium text-on-surface">
        <div className="flex items-center gap-space-xs">
          <span className="truncate">{order.customer}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim" />
          <span className="font-body-sm text-body-sm text-secondary">{order.customerNote}</span>
        </div>
      </td>
      <td className="py-3.5 px-space-md text-secondary font-body-sm text-body-sm">
        {formatDate(order.orderDate)}
      </td>
      <td
        className={cn(
          "py-3.5 px-space-md text-right font-data-mono text-data-mono font-medium",
          canceled ? "text-secondary line-through" : "text-on-surface",
        )}
      >
        {formatCurrency(order.total)}
      </td>
      <td className="py-3.5 px-space-md text-center">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="py-3.5 px-space-md text-right">
        <div className="inline-flex items-center justify-end gap-space-xs">
          <Link
            href={ROUTES.orderDetail(order.id)}
            className="px-2.5 py-1 rounded hover:bg-surface-container-high text-primary font-label-md text-label-md transition-colors"
          >
            View
          </Link>
          <button
            className="p-1 rounded text-secondary hover:text-on-surface hover:bg-surface-container-high transition-colors"
            title="More options"
            type="button"
          >
            <Icon name="more_horiz" className="text-[18px]" />
          </button>
        </div>
      </td>
    </tr>
  );
}
