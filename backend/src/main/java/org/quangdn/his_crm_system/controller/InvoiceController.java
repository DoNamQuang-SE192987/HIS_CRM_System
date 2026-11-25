package org.quangdn.his_crm_system.controller;

import lombok.RequiredArgsConstructor;
import org.quangdn.his_crm_system.config.RequireRole;
import org.quangdn.his_crm_system.dto.respone.InvoiceResponse;
import org.quangdn.his_crm_system.service.InvoiceService;
import org.quangdn.his_crm_system.service.InvoiceService.IssueResult;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import static org.quangdn.his_crm_system.enums.Role.MANAGER;
import static org.quangdn.his_crm_system.enums.Role.SALES;

/** Invoices. Issue: Sales. Print data: Sales, Manager. */
@RestController
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    /** 201 + Location when the invoice is issued now; 200 with the same invoice when it already existed. */
    @PostMapping("/orders/{orderId}/invoice")
    @RequireRole(SALES)
    public ResponseEntity<InvoiceResponse> issue(@PathVariable Long orderId) {
        IssueResult result = invoiceService.issueForOrder(orderId);
        if (!result.created()) {
            return ResponseEntity.ok(result.invoice());
        }
        return ResponseEntity
                .created(ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/invoices/{id}").buildAndExpand(result.invoice().id()).toUri())
                .body(result.invoice());
    }

    @GetMapping("/invoices/{id}")
    @RequireRole({SALES, MANAGER})
    public InvoiceResponse get(@PathVariable Long id) {
        return invoiceService.get(id);
    }
}
