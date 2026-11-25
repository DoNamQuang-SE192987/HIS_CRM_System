import Link from "next/link";
import { OrderInfoCard } from "@/components/orders/OrderInfoCard";
import { OrderLineItemsCard } from "@/components/orders/OrderLineItemsCard";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Icon } from "@/components/ui";
import { ROUTES } from "@/constants";
import type { OrderDetail } from "@/interfaces";
import { formatDateTime } from "@/utils";

export function OrderDetailPage({ order }: { order: OrderDetail }) {
  const canFulfil = order.status === "new";

  return (
    <div className="p-margin max-w-[1440px] mx-auto w-full flex flex-col gap-space-lg">
      {/* Breadcrumb, title & actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col gap-space-xs">
          <nav className="flex items-center gap-space-xs text-secondary font-label-md text-label-md">
            <Link className="hover:text-primary transition-colors" href={ROUTES.orders}>
              Orders
            </Link>
            <Icon name="chevron_right" className="text-[14px]" />
            <span className="text-on-surface font-semibold">{order.id}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Order {order.id}
            </h1>
            <OrderStatusBadge status={order.status} />
            <span className="flex items-center gap-1 font-body-sm text-body-sm text-secondary">
              <Icon name="schedule" className="text-[16px] text-secondary" />
              Created {formatDateTime(order.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-space-sm pt-space-xs md:pt-0">
          {order.invoice && (
            <Link
              href={ROUTES.orderInvoice(order.id)}
              className="inline-flex items-center gap-space-xs h-[38px] px-4 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-high transition-colors font-body-md text-body-md shadow-sm"
            >
              <Icon name="receipt_long" className="text-[18px]" />
              <span>View Invoice</span>
            </Link>
          )}
          {canFulfil && (
            <>
              <button
                className="inline-flex items-center gap-space-xs h-[38px] px-4 rounded-lg bg-error-container/30 text-error hover:bg-error-container/70 transition-colors font-body-md text-body-md shadow-sm"
                type="button"
              >
                <Icon name="cancel" className="text-[18px]" />
                <span>Cancel Order</span>
              </button>
              <button
                className="inline-flex items-center gap-space-xs h-[38px] px-4 rounded-lg bg-primary-container text-on-primary hover:opacity-90 active:scale-[0.99] transition-all font-body-md text-body-md font-medium shadow-sm"
                type="button"
              >
                <Icon name="local_shipping" className="text-[18px]" />
                <span>Mark as Shipped</span>
              </button>
            </>
          )}
        </div>
      </div>

      <OrderInfoCard order={order} />
      <OrderLineItemsCard order={order} />
    </div>
  );
}
