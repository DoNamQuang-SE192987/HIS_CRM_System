package org.quangdn.his_crm_system.service;

import org.quangdn.his_crm_system.dto.respone.DashboardSummaryResponse;

/** Manager overview: KPIs + the lists that need attention today. */
public interface DashboardService {

    int RECENT_ORDERS = 5;
    int LIST_LIMIT = 10;

    DashboardSummaryResponse summary();
}
