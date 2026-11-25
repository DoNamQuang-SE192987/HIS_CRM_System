package org.quangdn.his_crm_system.controller;

import lombok.RequiredArgsConstructor;
import org.quangdn.his_crm_system.config.RequireRole;
import org.quangdn.his_crm_system.dto.respone.DashboardSummaryResponse;
import org.quangdn.his_crm_system.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static org.quangdn.his_crm_system.enums.Role.MANAGER;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @RequireRole(MANAGER)
    public DashboardSummaryResponse summary() {
        return dashboardService.summary();
    }
}
