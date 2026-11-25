"use client";

import { useMemo, useState } from "react";
import { BulkSelectionBar } from "@/components/orders/BulkSelectionBar";
import { OrderMetricCard } from "@/components/orders/OrderMetricCard";
import { OrdersTableRow } from "@/components/orders/OrdersTableRow";
import { Icon, Pagination } from "@/components/ui";
import { usePagination, useSelection } from "@/hooks";
import type { ChannelGroup, Order, OrderStats, OrderStatus } from "@/interfaces";
import { cn, formatCurrency, formatDate, getChannelGroup } from "@/utils";

type StatusFilter = "all" | OrderStatus;
type ChannelFilter = "all" | ChannelGroup;

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "shipped", label: "Shipped" },
  { value: "canceled", label: "Canceled" },
];

const PAGE_SIZE_OPTIONS = [8, 25, 50];

interface OrdersListPageProps {
  orders: Order[];
  stats: OrderStats;
}

export function OrdersListPage({ orders, stats }: OrdersListPageProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>("all");
  const [query, setQuery] = useState("");

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = { all: orders.length, new: 0, shipped: 0, canceled: 0 };
    orders.forEach((order) => (counts[order.status] += 1));
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesChannel = channelFilter === "all" || getChannelGroup(order.channel) === channelFilter;
      const matchesQuery =
        !q ||
        [order.id, order.customer, order.customerNote, order.reference]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return matchesStatus && matchesChannel && matchesQuery;
    });
  }, [orders, statusFilter, channelFilter, query]);

  const pagination = usePagination(filteredOrders, PAGE_SIZE_OPTIONS[0]);
  const visibleIds = useMemo(() => pagination.pageItems.map((order) => order.id), [pagination.pageItems]);
  const selection = useSelection(visibleIds);

  const dateRange = useMemo(() => {
    if (orders.length === 0) return "—";
    const dates = orders.map((order) => order.orderDate).sort();
    return `${formatDate(dates[0])} – ${formatDate(dates[dates.length - 1])}`;
  }, [orders]);

  return (
    <div className="px-margin py-space-xl flex flex-col gap-space-lg max-w-[1440px] w-full mx-auto">
      {/* Title & actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
              Orders
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary font-label-sm text-label-sm">
              Live Sync
            </span>
          </div>
          <p className="font-body-md text-body-md text-secondary mt-0.5">
            Manage wholesale and marketplace customer sales orders
          </p>
        </div>
        <div className="flex items-center gap-space-sm">
          <button
            className="inline-flex items-center gap-space-xs px-4 h-[38px] rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-low font-label-md text-label-md shadow-sm transition-colors"
            type="button"
          >
            <Icon name="file_download" className="text-[18px] text-secondary" />
            <span>Export CSV</span>
          </button>
          <button
            className="inline-flex items-center gap-space-xs px-4 h-[38px] rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md shadow-sm transition-colors focus:outline-none"
            type="button"
          >
            <Icon name="add" className="text-[20px]" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
        <OrderMetricCard
          label="Total Volume"
          value={formatCurrency(stats.totalVolume)}
          hint={`+${stats.volumeTrendPct}% vs last week`}
          hintIcon="trending_up"
          hintClassName="text-primary"
          icon="payments"
          iconClassName="bg-surface-container-low text-primary"
        />
        <OrderMetricCard
          label="Awaiting Dispatch"
          value={`${stats.awaitingDispatch} Orders`}
          hint={`${stats.priorityColdChain} priority cold-chain`}
          hintIcon="schedule"
          hintClassName="text-tertiary"
          icon="inventory"
          iconClassName="bg-tertiary-fixed text-tertiary"
        />
        <OrderMetricCard
          label="Dispatched Today"
          value={`${stats.dispatchedToday} Orders`}
          hint="On schedule"
          hintIcon="done_all"
          hintClassName="text-primary"
          icon="local_shipping"
          iconClassName="bg-surface-container-low text-primary"
        />
        <OrderMetricCard
          label="Exceptions / Hold"
          value={`${stats.exceptions} Orders`}
          hint="Buyer canceled"
          hintIcon="cancel"
          hintClassName="text-error"
          icon="remove_shopping_cart"
          iconClassName="bg-error-container text-on-error-container"
        />
      </div>

      {/* Table card */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-space-md flex flex-col gap-space-md bg-surface-container-lowest">
          {/* Status tabs */}
          <div className="flex items-center justify-between flex-wrap gap-space-sm">
            <div className="flex items-center gap-space-xs p-1 bg-surface-container-low rounded-lg" role="tablist">
              {STATUS_TABS.map((tab) => {
                const active = statusFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    role="tab"
                    aria-selected={active}
                    className={cn(
                      "px-3.5 py-1.5 rounded-md font-label-md text-label-md transition-all",
                      active
                        ? "bg-surface-container-lowest text-primary shadow-sm font-semibold"
                        : "text-secondary hover:text-on-surface",
                    )}
                    type="button"
                    onClick={() => {
                      setStatusFilter(tab.value);
                      pagination.setPage(1);
                    }}
                  >
                    {tab.label}{" "}
                    {tab.value === "new" ? (
                      <span className="ml-1 px-1.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px]">
                        {statusCounts[tab.value]}
                      </span>
                    ) : (
                      <span className="ml-1 text-secondary font-normal">{statusCounts[tab.value]}</span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-space-sm text-secondary font-body-sm text-body-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-primary" />
              <span>Batch processing active</span>
            </div>
          </div>

          {/* Search / filters */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm items-center">
            <div className="md:col-span-6 relative flex items-center">
              <Icon
                name="search"
                className="absolute left-3 text-secondary text-[20px] pointer-events-none"
              />
              <input
                className="w-full h-[38px] pl-10 pr-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-colors"
                placeholder="Search by Order # or Customer..."
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  pagination.setPage(1);
                }}
              />
            </div>
            <div className="md:col-span-3">
              <div className="relative">
                <select
                  className="w-full h-[38px] pl-3 pr-8 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none appearance-none cursor-pointer"
                  value={channelFilter}
                  onChange={(event) => {
                    setChannelFilter(event.target.value as ChannelFilter);
                    pagination.setPage(1);
                  }}
                  aria-label="Filter by channel"
                >
                  <option value="all">All Channels</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="ecommerce">E-commerce (Walmart, Amazon)</option>
                </select>
                <Icon
                  name="expand_more"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary text-[18px] pointer-events-none"
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <button
                className="w-full h-[38px] px-3 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm flex items-center justify-between transition-colors"
                type="button"
              >
                <div className="flex items-center gap-space-xs truncate">
                  <Icon name="date_range" className="text-[18px] text-secondary" />
                  <span className="truncate">{dateRange}</span>
                </div>
                <Icon name="arrow_drop_down" className="text-[16px] text-secondary" />
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low text-secondary font-label-md text-label-md tracking-wider uppercase">
                <th className="py-3 px-space-md font-semibold w-12 text-center" scope="col">
                  <input
                    className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer accent-primary"
                    type="checkbox"
                    checked={selection.allVisibleSelected}
                    onChange={(event) => selection.toggleAllVisible(event.target.checked)}
                    aria-label="Select all orders on this page"
                  />
                </th>
                <th className="py-3 px-space-md font-semibold" scope="col">Order #</th>
                <th className="py-3 px-space-md font-semibold" scope="col">Channel</th>
                <th className="py-3 px-space-md font-semibold" scope="col">Customer</th>
                <th className="py-3 px-space-md font-semibold" scope="col">Order Date</th>
                <th className="py-3 px-space-md font-semibold text-right" scope="col">Total ($USD)</th>
                <th className="py-3 px-space-md font-semibold text-center" scope="col">Status</th>
                <th className="py-3 px-space-md font-semibold text-right" scope="col">Actions</th>
              </tr>
            </thead>
            <tbody className="text-on-surface font-body-md text-body-md">
              {pagination.pageItems.map((order) => (
                <OrdersTableRow
                  key={order.id}
                  order={order}
                  selected={selection.isSelected(order.id)}
                  onToggleSelect={() => selection.toggle(order.id)}
                />
              ))}
              {pagination.pageItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-secondary font-body-sm text-body-sm">
                    No orders match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / pagination */}
        <div className="p-space-md bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="font-body-sm text-body-sm text-secondary">
              Showing <span className="font-semibold text-on-surface">{pagination.rangeStart}</span> to{" "}
              <span className="font-semibold text-on-surface">{pagination.rangeEnd}</span> of{" "}
              <span className="font-semibold text-on-surface">{pagination.totalItems}</span> orders
            </span>
            <span className="text-outline-variant">•</span>
            <label className="flex items-center gap-1.5 font-label-sm text-label-sm text-secondary">
              Per page:
              <select
                className="h-7 px-2 bg-surface-container-low rounded text-on-surface font-body-sm text-body-sm focus:outline-none"
                value={pagination.pageSize}
                onChange={(event) => pagination.setPageSize(Number(event.target.value))}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={pagination.setPage}
          />
        </div>
      </div>

      <BulkSelectionBar selectedCount={selection.selectedCount} />
    </div>
  );
}
