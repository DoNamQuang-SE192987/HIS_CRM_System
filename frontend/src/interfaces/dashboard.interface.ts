export interface DashboardStats {
  updatedAtLabel: string;
  ordersToday: number;
  ordersYesterday: number;
  ordersToShip: {
    wholesale: number;
    ecommerce: number;
  };
  revenueThisMonth: number;
  fulfillmentCutoff: {
    time: string;
    remaining: string;
  };
  supplierLeadTimeDays: number;
}
