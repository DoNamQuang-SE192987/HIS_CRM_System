"use client";

import Link from "next/link";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { LowStockCard } from "@/components/dashboard/LowStockCard";
import { ErrorState, LoadingState, PageHeader } from "@/components/common";
import { OrdersMiniTable } from "@/components/orders/OrdersMiniTable";
import { BUTTON, CARD, Icon } from "@/components/ui";
import { ROUTES } from "@/constants";
import { useApi } from "@/hooks";
import { dashboardService } from "@/services";
import { cn, formatCurrencyWhole, formatDateTime } from "@/utils";

export function DashboardPage() {
  const { data, error, loading, reload } = useApi(() => dashboardService.summary(), []);

  return (
    <div className="px-margin py-space-lg flex flex-col gap-space-lg max-w-[1440px] mx-auto w-full">
      <PageHeader
        eyebrow="Manager overview"
        title="Operations Dashboard"
        subtitle="Today's orders, shipping backlog, revenue and stock health"
        actions={
          <>
            {data && (
              <span className="flex items-center gap-space-xs text-secondary font-label-md text-label-md px-3 py-1.5 rounded-lg bg-surface-container-low">
                <Icon name="schedule" className="text-[16px] text-outline" />
                Updated {formatDateTime(data.generatedAt)}
              </span>
            )}
            <button className={BUTTON.secondary} type="button" onClick={reload} disabled={loading}>
              <Icon name="refresh" className={cn("text-[18px]", loading && "animate-spin")} />
              Refresh
            </button>
          </>
        }
      />

      {error ? (
        <ErrorState error={error} onRetry={reload} />
      ) : !data ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            <KpiCard
              label="Orders Today"
              icon="shopping_cart"
              value={data.ordersToday}
              footer={<span className="font-label-sm text-label-sm text-secondary">Excluding canceled orders</span>}
            />
            <KpiCard
              label="Orders To Ship"
              icon="pending_actions"
              iconClassName="bg-surface-container text-tertiary"
              value={data.ordersToShip}
              footer={
                <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm font-medium">
                  {data.ordersToShipByChannel.WHOLESALE} wholesale · {data.ordersToShipByChannel.WALMART} Walmart ·{" "}
                  {data.ordersToShipByChannel.AMAZON} Amazon
                </span>
              }
            />
            <KpiCard
              label="Revenue This Month"
              icon="payments"
              iconClassName="bg-surface-container text-primary-container"
              value={formatCurrencyWhole(data.revenueThisMonth)}
              footer={<span className="font-label-sm text-label-sm text-secondary">From shipped orders · USD</span>}
            />
            <KpiCard
              label="Low-Stock Products"
              icon="warning"
              iconClassName="bg-error-container text-error"
              valueClassName={data.lowStockCount > 0 ? "text-error" : "text-on-surface"}
              value={data.lowStockCount}
              footer={
                <span className="font-label-sm text-label-sm text-secondary">Below minimum or out of stock</span>
              }
            />
          </div>

          {data.overdueCount > 0 && (
            <div className={cn(CARD, "overflow-hidden flex flex-col ring-1 ring-error/30")}>
              <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <Icon name="alarm" className="text-error text-[22px]" />
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Overdue Orders</h2>
                  <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                    {data.overdueCount}
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-secondary">
                  Still NEW after the marketplace ship-by date
                </span>
              </div>
              <OrdersMiniTable orders={data.overdueOrders} variant="overdue" emptyText="No overdue orders" />
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-gutter items-start">
            <LowStockCard products={data.lowStockProducts} totalCount={data.lowStockCount} />

            <div className={cn(CARD, "overflow-hidden flex flex-col")}>
              <div className="px-6 py-4 flex items-center justify-between">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">Recent Orders</h2>
                <Link
                  className="font-label-md text-label-md text-primary font-medium hover:underline flex items-center gap-1"
                  href={ROUTES.orders}
                >
                  View all orders
                  <Icon name="arrow_forward" className="text-[16px]" />
                </Link>
              </div>
              <OrdersMiniTable orders={data.recentOrders} emptyText="No orders yet" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
