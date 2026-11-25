import { DASHBOARD_STATS_MOCK } from "@/constants/mock-data";
import type { DashboardStats } from "@/interfaces";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return DASHBOARD_STATS_MOCK;
  },
};
