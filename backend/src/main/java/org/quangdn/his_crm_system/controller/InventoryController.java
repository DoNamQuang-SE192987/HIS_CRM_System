package org.quangdn.his_crm_system.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.quangdn.his_crm_system.config.RequireRole;
import org.quangdn.his_crm_system.dto.request.DamagedStockRequest;
import org.quangdn.his_crm_system.dto.request.InventoryTransactionFilter;
import org.quangdn.his_crm_system.dto.request.StockInRequest;
import org.quangdn.his_crm_system.dto.respone.InventoryItemResponse;
import org.quangdn.his_crm_system.dto.respone.InventoryTransactionResponse;
import org.quangdn.his_crm_system.dto.respone.PageResponse;
import org.quangdn.his_crm_system.enums.InventoryTransactionType;
import org.quangdn.his_crm_system.enums.StockStatus;
import org.quangdn.his_crm_system.service.InventoryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

import static org.quangdn.his_crm_system.enums.Role.MANAGER;
import static org.quangdn.his_crm_system.enums.Role.WAREHOUSE;

/** Warehouse: stock table, ledger, manual stock-in, damage write-off. */
@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    /** Stock table. Optional {@code q} (SKU / name) and {@code status} (IN_STOCK / LOW / OUT). */
    @GetMapping
    @RequireRole({WAREHOUSE, MANAGER})
    public List<InventoryItemResponse> list(@RequestParam(required = false) String q,
                                            @RequestParam(required = false) StockStatus status) {
        return inventoryService.list(q, status);
    }

    /** Ledger, newest first. {@code from} / {@code to} are inclusive dates (yyyy-MM-dd). */
    @GetMapping("/transactions")
    @RequireRole({WAREHOUSE, MANAGER})
    public PageResponse<InventoryTransactionResponse> transactions(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) InventoryTransactionType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "" + InventoryService.DEFAULT_PAGE_SIZE) int size) {
        return inventoryService.transactions(new InventoryTransactionFilter(productId, type, from, to), page, size);
    }

    @PostMapping("/stock-in")
    @ResponseStatus(HttpStatus.CREATED)
    @RequireRole(WAREHOUSE)
    public InventoryTransactionResponse stockIn(@Valid @RequestBody StockInRequest request) {
        return inventoryService.stockIn(request);
    }

    @PostMapping("/damaged")
    @ResponseStatus(HttpStatus.CREATED)
    @RequireRole(WAREHOUSE)
    public InventoryTransactionResponse damaged(@Valid @RequestBody DamagedStockRequest request) {
        return inventoryService.recordDamaged(request);
    }
}
