import type { DashboardSummary } from "@/interfaces";
import { apiRequest } from "./api-client";

export const dashboardService = {
  summary: () => apiRequest<DashboardSummary>("/dashboard/summary"),
};
