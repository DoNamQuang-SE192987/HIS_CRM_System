import type { DashboardStats } from "@/interfaces";

export const DASHBOARD_STATS_MOCK: DashboardStats = {
  updatedAtLabel: "Today, 10:45 AM",
  ordersToday: 42,
  ordersYesterday: 34,
  ordersToShip: { wholesale: 12, ecommerce: 6 },
  revenueThisMonth: 148920,
  fulfillmentCutoff: { time: "3:30 PM PST", remaining: "4h 45m" },
  supplierLeadTimeDays: 4,
};
