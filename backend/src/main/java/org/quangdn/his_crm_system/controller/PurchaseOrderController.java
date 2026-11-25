package org.quangdn.his_crm_system.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.quangdn.his_crm_system.config.RequireRole;
import org.quangdn.his_crm_system.dto.request.PurchaseOrderCreateRequest;
import org.quangdn.his_crm_system.dto.respone.PageResponse;
import org.quangdn.his_crm_system.dto.respone.PurchaseOrderDetailResponse;
import org.quangdn.his_crm_system.dto.respone.PurchaseOrderSummaryResponse;
import org.quangdn.his_crm_system.enums.PurchaseOrderStatus;
import org.quangdn.his_crm_system.service.PurchaseOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import static org.quangdn.his_crm_system.enums.Role.MANAGER;
import static org.quangdn.his_crm_system.enums.Role.WAREHOUSE;

/** Purchase orders. Writes: Warehouse. Reads: Warehouse, Manager. */
@RestController
@RequestMapping("/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping
    @RequireRole({WAREHOUSE, MANAGER})
    public PageResponse<PurchaseOrderSummaryResponse> list(
            @RequestParam(required = false) PurchaseOrderStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "" + PurchaseOrderService.DEFAULT_PAGE_SIZE) int size) {
        return purchaseOrderService.search(status, page, size);
    }

    @GetMapping("/{id}")
    @RequireRole({WAREHOUSE, MANAGER})
    public PurchaseOrderDetailResponse get(@PathVariable Long id) {
        return purchaseOrderService.get(id);
    }

    @PostMapping
    @RequireRole(WAREHOUSE)
    public ResponseEntity<PurchaseOrderDetailResponse> create(@Valid @RequestBody PurchaseOrderCreateRequest request) {
        PurchaseOrderDetailResponse created = purchaseOrderService.create(request);
        return ResponseEntity
                .created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri())
                .body(created);
    }

    @PostMapping("/{id}/receive")
    @RequireRole(WAREHOUSE)
    public PurchaseOrderDetailResponse receive(@PathVariable Long id) {
        return purchaseOrderService.receive(id);
    }
}
