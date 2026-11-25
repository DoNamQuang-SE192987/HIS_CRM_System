package org.quangdn.his_crm_system.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.quangdn.his_crm_system.config.RequireRole;
import org.quangdn.his_crm_system.dto.request.OrderCreateRequest;
import org.quangdn.his_crm_system.dto.request.OrderFilter;
import org.quangdn.his_crm_system.dto.respone.OrderDetailResponse;
import org.quangdn.his_crm_system.dto.respone.OrderImportResponse;
import org.quangdn.his_crm_system.dto.respone.OrderSummaryResponse;
import org.quangdn.his_crm_system.dto.respone.PageResponse;
import org.quangdn.his_crm_system.enums.OrderStatus;
import org.quangdn.his_crm_system.enums.SalesChannel;
import org.quangdn.his_crm_system.exception.RequestValidationException;
import org.quangdn.his_crm_system.service.OrderImportService;
import org.quangdn.his_crm_system.service.OrderService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.quangdn.his_crm_system.enums.Role.MANAGER;
import static org.quangdn.his_crm_system.enums.Role.SALES;
import static org.quangdn.his_crm_system.enums.Role.WAREHOUSE;

/**
 * Sales orders. Create / import / cancel: Sales. Ship: Warehouse. Reads: Sales, Warehouse, Manager
 * (the warehouse needs the list to find NEW orders to ship).
 */
@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderImportService orderImportService;

    @GetMapping
    @RequireRole({SALES, WAREHOUSE, MANAGER})
    public PageResponse<OrderSummaryResponse> list(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) SalesChannel channel,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "" + OrderService.DEFAULT_PAGE_SIZE) int size) {
        return orderService.search(new OrderFilter(status, channel, q), page, size);
    }

    @GetMapping("/{id}")
    @RequireRole({SALES, WAREHOUSE, MANAGER})
    public OrderDetailResponse get(@PathVariable Long id) {
        return orderService.get(id);
    }

    @PostMapping
    @RequireRole(SALES)
    public ResponseEntity<OrderDetailResponse> create(@Valid @RequestBody OrderCreateRequest request) {
        OrderDetailResponse created = orderService.create(request);
        return ResponseEntity
                .created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri())
                .body(created);
    }

    /**
     * Bulk-create marketplace orders from the Walmart / Amazon order export (CSV, semicolon or tab separated).
     * Always 200 with a per-order report; only a malformed file (missing columns, empty) is a 400.
     */
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RequireRole(SALES)
    public OrderImportResponse importOrders(@RequestParam SalesChannel channel,
                                            @RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RequestValidationException("file", "is empty");
        }
        return orderImportService.importCsv(channel, new String(file.getBytes(), StandardCharsets.UTF_8));
    }

    @GetMapping(value = "/import/template", produces = "text/csv")
    @RequireRole({SALES, MANAGER})
    public ResponseEntity<String> importTemplate() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"marketplace-orders-template.csv\"")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(orderImportService.template());
    }

    @PostMapping("/{id}/ship")
    @RequireRole(WAREHOUSE)
    public OrderDetailResponse ship(@PathVariable Long id) {
        return orderService.ship(id);
    }

    @PostMapping("/{id}/cancel")
    @RequireRole(SALES)
    public OrderDetailResponse cancel(@PathVariable Long id) {
        return orderService.cancel(id);
    }
}
