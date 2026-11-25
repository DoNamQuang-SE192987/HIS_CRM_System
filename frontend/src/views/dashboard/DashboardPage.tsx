import { FulfillmentCutoffBanner } from "@/components/dashboard/FulfillmentCutoffBanner";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { LowStockAlertCard } from "@/components/dashboard/LowStockAlertCard";
import { RecentOrdersCard } from "@/components/dashboard/RecentOrdersCard";
import { Icon } from "@/components/ui";
import type { DashboardStats, Order, Product } from "@/interfaces";
import { formatCurrencyWhole } from "@/utils";

interface DashboardPageProps {
  stats: DashboardStats;
  lowStockProducts: Product[];
  recentOrders: Order[];
}

export function DashboardPage({ stats, lowStockProducts, recentOrders }: DashboardPageProps) {
  const ordersDelta = stats.ordersToday - stats.ordersYesterday;

  return (
    <div className="px-margin py-space-lg flex flex-col gap-space-lg max-w-[1440px] mx-auto w-full">
      {/* Title & actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pb-space-xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Operations Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              Real-time
            </span>
          </div>
          <p className="font-body-md text-body-md text-secondary mt-0.5">
            Daily order fulfillment and inventory health across primary commercial channels
          </p>
        </div>
        <div className="flex items-center gap-space-md self-start md:self-auto">
          <div className="flex items-center gap-space-xs text-secondary font-label-md text-label-md px-3 py-1.5 rounded-lg bg-surface-container-low shadow-sm">
            <Icon name="schedule" className="text-[16px] text-outline" />
            <span>Updated: {stats.updatedAtLabel}</span>
          </div>
          <button
            className="h-[38px] px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-medium hover:bg-primary transition-colors shadow-sm flex items-center gap-space-xs"
            type="button"
          >
            <Icon name="add" className="text-[18px]" />
            <span>New Sales Order</span>
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <KpiCard
          label="Orders Today"
          icon="shopping_cart"
          value={stats.ordersToday}
          footer={
            <div className="flex items-center gap-1.5 font-label-sm text-label-sm">
              <span className="inline-flex items-center text-primary font-semibold">
                <Icon name={ordersDelta >= 0 ? "trending_up" : "trending_down"} className="text-[15px]" />
                {ordersDelta >= 0 ? `+${ordersDelta}` : ordersDelta}
              </span>
              <span className="text-secondary font-normal">
                vs yesterday ({stats.ordersYesterday})
              </span>
            </div>
          }
        />
        <KpiCard
          label="Orders To Ship"
          icon="pending_actions"
          iconClassName="bg-surface-container text-tertiary"
          value={stats.ordersToShip.wholesale + stats.ordersToShip.ecommerce}
          footer={
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed font-label-sm text-label-sm font-medium">
                {stats.ordersToShip.wholesale} wholesale · {stats.ordersToShip.ecommerce} e-comm
              </span>
            </div>
          }
        />
        <KpiCard
          label="Low-Stock Products"
          icon="warning"
          iconClassName="bg-error-container text-error"
          valueClassName="text-error"
          value={lowStockProducts.length}
          footer={
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-error" />
                Action required
              </span>
            </div>
          }
        />
        <KpiCard
          label="Revenue This Month"
          icon="payments"
          iconClassName="bg-surface-container text-primary-container"
          value={formatCurrencyWhole(stats.revenueThisMonth)}
          footer={
            <div className="flex items-center gap-1.5 font-label-sm text-label-sm">
              <span className="text-secondary font-normal">USD · Gross food sales</span>
            </div>
          }
        />
      </div>

      {/* Low stock + recent orders */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter items-start">
        <LowStockAlertCard
          products={lowStockProducts}
          supplierLeadTimeDays={stats.supplierLeadTimeDays}
        />
        <RecentOrdersCard orders={recentOrders} />
      </div>

      <FulfillmentCutoffBanner
        cutoffTime={stats.fulfillmentCutoff.time}
        remaining={stats.fulfillmentCutoff.remaining}
      />
    </div>
  );
}
