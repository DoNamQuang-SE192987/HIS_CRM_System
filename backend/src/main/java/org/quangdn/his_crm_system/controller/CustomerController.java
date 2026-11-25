package org.quangdn.his_crm_system.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.quangdn.his_crm_system.config.RequireRole;
import org.quangdn.his_crm_system.dto.request.CustomerCreateRequest;
import org.quangdn.his_crm_system.dto.respone.CustomerResponse;
import org.quangdn.his_crm_system.service.CustomerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;

import static org.quangdn.his_crm_system.enums.Role.MANAGER;
import static org.quangdn.his_crm_system.enums.Role.SALES;

/** Customers. Sales (and Manager) only. */
@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    /** Dropdown source for the order form. {@code q} filters by name or phone. */
    @GetMapping
    @RequireRole({SALES, MANAGER})
    public List<CustomerResponse> list(@RequestParam(required = false) String q) {
        return customerService.list(q);
    }

    @PostMapping
    @RequireRole({SALES, MANAGER})
    public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CustomerCreateRequest request) {
        CustomerResponse created = customerService.create(request);
        return ResponseEntity
                .created(ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(created.id()).toUri())
                .body(created);
    }
}
