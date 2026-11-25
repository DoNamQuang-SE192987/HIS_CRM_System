package org.quangdn.his_crm_system.controller;

import lombok.RequiredArgsConstructor;
import org.quangdn.his_crm_system.config.RequireRole;
import org.quangdn.his_crm_system.dto.respone.SupplierResponse;
import org.quangdn.his_crm_system.service.SupplierService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import static org.quangdn.his_crm_system.enums.Role.MANAGER;
import static org.quangdn.his_crm_system.enums.Role.WAREHOUSE;

/** Suppliers - seeded master data, read-only in the MVP. */
@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    @RequireRole({WAREHOUSE, MANAGER})
    public List<SupplierResponse> list() {
        return supplierService.list();
    }
}
