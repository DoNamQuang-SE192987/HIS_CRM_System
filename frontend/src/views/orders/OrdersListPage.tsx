"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyRow, ErrorState, LoadingState, PageHeader } from "@/components/common";
import { ChannelBadge } from "@/components/orders/ChannelBadge";
import { ImportOrdersModal } from "@/components/orders/ImportOrdersModal";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { BUTTON, CARD, Icon, Pagination, SearchInput, Select, TABLE_HEAD_ROW } from "@/components/ui";
import { ROUTES, SALES_CHANNEL_STYLES, SALES_CHANNELS, can } from "@/constants";
import { useApi, useDebouncedValue } from "@/hooks";
import type { OrderStatus, SalesChannel } from "@/interfaces";
import { orderService } from "@/services";
import { useAuthStore } from "@/stores";
import { cn, formatCurrency, formatDate } from "@/utils";

type StatusTab = "ALL" | OrderStatus;

const STATUS_TABS: { value: StatusTab; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "NEW", label: "New (to ship)" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "CANCELED", label: "Canceled" },
];

const PAGE_SIZE = 15;

export function OrdersListPage() {
  const role = useAuthStore((state) => state.role);
  const [status, setStatus] = useState<StatusTab>("ALL");
  const [channel, setChannel] = useState<SalesChannel | "">("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [importing, setImporting] = useState(false);
  const q = useDebouncedValue(query);

  const { data, error, loading, reload } = useApi(
    () =>
      orderService.list({
        status: status === "ALL" ? undefined : status,
        channel: channel || undefined,
        q,
        page,
        size: PAGE_SIZE,
      }),
    [status, channel, q, page],
  );

  const rangeStart = data && data.totalItems > 0 ? (data.page - 1) * data.size + 1 : 0;
  const rangeEnd = data ? rangeStart + data.items.length - (data.items.length ? 1 : 0) : 0;

  return (
    <div className="px-margin py-space-xl flex flex-col gap-space-lg max-w-[1440px] w-full mx-auto">
      <PageHeader
        eyebrow="Sales"
        title="Orders"
        subtitle="Wholesale and marketplace (Walmart, Amazon) sales orders"
        actions={
          <>
            {can(role, "importOrders") && (
              <button className={BUTTON.secondary} type="button" onClick={() => setImporting(true)}>
                <Icon name="upload_file" className="text-[18px] text-secondary" />
                Import CSV
              </button>
            )}
            {can(role, "createOrder") && (
              <Link className={BUTTON.primary} href={ROUTES.orderNew}>
                <Icon name="add" className="text-[18px]" />
                New Order
              </Link>
            )}
          </>
        }
      />

      <div className={cn(CARD, "overflow-hidden flex flex-col")}>
        <div className="p-space-md flex flex-col gap-space-md">
          <div className="flex items-center gap-space-xs p-1 bg-surface-container-low rounded-lg w-fit" role="tablist">
            {STATUS_TABS.map((tab) => {
              const active = status === tab.value;
              return (
                <button
                  key={tab.value}
                  role="tab"
                  aria-selected={active}
                  className={cn(
                    "px-3.5 py-1.5 rounded-md font-label-md text-label-md transition-all",
                    active ? "bg-surface-container-lowest text-primary shadow-sm font-semibold" : "text-secondary hover:text-on-surface",
                  )}
                  type="button"
                  onClick={() => {
                    setStatus(tab.value);
                    setPage(1);
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-space-sm items-center">
            <SearchInput
              className="md:col-span-8"
              placeholder="Search by order #, marketplace order #, customer or recipient..."
              value={query}
              onChange={(value) => {
                setQuery(value);
                setPage(1);
              }}
            />
            <Select
              wrapperClassName="md:col-span-4"
              aria-label="Filter by channel"
              value={channel}
              onChange={(e) => {
                setChannel(e.target.value as SalesChannel | "");
                setPage(1);
              }}
            >
              <option value="">All Channels</option>
              {SALES_CHANNELS.map((item) => (
                <option key={item} value={item}>
                  {SALES_CHANNEL_STYLES[item].label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {error ? (
          <div className="p-space-md">
            <ErrorState error={error} onRetry={reload} />
          </div>
        ) : !data ? (
          <LoadingState />
        ) : (
          <>
            <div className={cn("overflow-x-auto w-full transition-opacity", loading && "opacity-60")}>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={TABLE_HEAD_ROW}>
                    <th className="py-3 px-space-md font-semibold">Order #</th>
                    <th className="py-3 px-space-md font-semibold">Channel</th>
                    <th className="py-3 px-space-md font-semibold">Customer</th>
                    <th className="py-3 px-space-md font-semibold">Order date</th>
                    <th className="py-3 px-space-md font-semibold">Ship by</th>
                    <th className="py-3 px-space-md font-semibold text-right">Total</th>
                    <th className="py-3 px-space-md font-semibold text-center">Status</th>
                    <th className="py-3 px-space-md font-semibold text-right" />
                  </tr>
                </thead>
                <tbody className="text-on-surface font-body-md text-body-md divide-y divide-surface-container-low">
                  {data.items.map((order) => {
                    const canceled = order.status === "CANCELED";
                    return (
                      <tr key={order.id} className="hover:bg-surface-container-low/60 transition-colors">
                        <td className="py-3 px-space-md">
                          <div className="flex flex-col">
                            <Link
                              href={ROUTES.orderDetail(order.id)}
                              className={cn(
                                "font-data-mono text-data-mono font-semibold hover:underline",
                                canceled ? "text-secondary line-through" : "text-primary",
                              )}
                            >
                              {order.code}
                            </Link>
                            {order.externalOrderNo && (
                              <span className="font-label-sm text-label-sm text-secondary font-data-mono">
                                {order.externalOrderNo}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-space-md">
                          <ChannelBadge channel={order.channel} />
                        </td>
                        <td className="py-3 px-space-md">
                          <div className="flex flex-col">
                            <span className="font-medium truncate max-w-[220px]">
                              {order.channel === "WHOLESALE" ? order.customerName : order.recipientName}
                            </span>
                            {order.channel !== "WHOLESALE" && (
                              <span className="font-label-sm text-label-sm text-secondary">{order.customerName}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-space-md text-secondary font-body-sm text-body-sm">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="py-3 px-space-md font-body-sm text-body-sm">
                          {order.overdue ? (
                            <span className="inline-flex items-center gap-1 text-error font-semibold" title="Not shipped before the ship-by date">
                              <Icon name="alarm" className="text-[16px]" />
                              {formatDate(order.shipBy)}
                            </span>
                          ) : (
                            <span className="text-secondary">{formatDate(order.shipBy)}</span>
                          )}
                        </td>
                        <td
                          className={cn(
                            "py-3 px-space-md text-right font-data-mono text-data-mono font-medium",
                            canceled && "text-secondary line-through",
                          )}
                        >
                          {formatCurrency(order.total)}
                        </td>
                        <td className="py-3 px-space-md text-center">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="py-3 px-space-md text-right">
                          <Link
                            href={ROUTES.orderDetail(order.id)}
                            className="px-2.5 py-1 rounded hover:bg-surface-container-high text-primary font-label-md text-label-md"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {data.items.length === 0 && <EmptyRow colSpan={8}>No orders match your filters.</EmptyRow>}
                </tbody>
              </table>
            </div>

            <div className="p-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
              <span className="font-body-sm text-body-sm text-secondary">
                Showing <b className="text-on-surface">{rangeStart}</b>–<b className="text-on-surface">{rangeEnd}</b> of{" "}
                <b className="text-on-surface">{data.totalItems}</b> orders
              </span>
              <Pagination page={data.page} totalPages={Math.max(1, data.totalPages)} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      {importing && <ImportOrdersModal onClose={() => setImporting(false)} onImported={reload} />}
    </div>
  );
}
