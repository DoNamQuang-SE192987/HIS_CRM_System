package org.quangdn.his_crm_system.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.quangdn.his_crm_system.config.RequireRole;
import org.quangdn.his_crm_system.dto.request.ProductCreateRequest;
import org.quangdn.his_crm_system.dto.request.ProductFilter;
import org.quangdn.his_crm_system.dto.request.ProductUpdateRequest;
import org.quangdn.his_crm_system.dto.respone.PageResponse;
import org.quangdn.his_crm_system.dto.respone.ProductResponse;
import org.quangdn.his_crm_system.enums.StockStatus;
import org.quangdn.his_crm_system.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import static org.quangdn.his_crm_system.enums.Role.MANAGER;
import static org.quangdn.his_crm_system.enums.Role.SALES;
import static org.quangdn.his_crm_system.enums.Role.WAREHOUSE;

/** Product catalogue. Reads: Sales, Warehouse, Manager. Writes: Manager only. */
@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @RequireRole({SALES, WAREHOUSE, MANAGER})
    public PageResponse<ProductResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) StockStatus stockStatus,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "" + ProductService.DEFAULT_PAGE_SIZE) int size) {
        return productService.search(new ProductFilter(q, brand, stockStatus, active), page, size);
    }

    @GetMapping("/{id}")
    @RequireRole({SALES, WAREHOUSE, MANAGER})
    public ProductResponse get(@PathVariable Long id) {
        return productService.get(id);
    }

    @PostMapping
    @RequireRole(MANAGER)
    public ResponseEntity<ProductResponse> create(@Valid @RequestBody ProductCreateRequest request) {
        ProductResponse created = productService.create(request);
        return ResponseEntity
                .created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri())
                .body(created);
    }

    @PutMapping("/{id}")
    @RequireRole(MANAGER)
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductUpdateRequest request) {
        return productService.update(id, request);
    }

    @PatchMapping("/{id}/toggle")
    @RequireRole(MANAGER)
    public ProductResponse toggle(@PathVariable Long id) {
        return productService.toggleActive(id);
    }
}
