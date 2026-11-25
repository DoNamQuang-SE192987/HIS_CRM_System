package org.quangdn.his_crm_system.service;

import org.quangdn.his_crm_system.dto.respone.InvoiceResponse;

/** Invoices: every sales order (wholesale or marketplace) gets exactly one. */
public interface InvoiceService {

    /**
     * @param invoice the invoice (new or existing)
     * @param created true = issued by this call (HTTP 201), false = already existed (HTTP 200)
     */
    record IssueResult(InvoiceResponse invoice, boolean created) {
    }

    /**
     * Issues the invoice of an order. Idempotent: if the order already has one it is returned unchanged.
     * Allowed for NEW and SHIPPED orders (a wholesale invoice may go out before the goods).
     *
     * @throws org.quangdn.his_crm_system.exception.InvalidStatusException    409, order is CANCELED
     * @throws org.quangdn.his_crm_system.exception.ResourceNotFoundException 404, unknown order
     */
    IssueResult issueForOrder(Long orderId);

    /** Print data. @throws org.quangdn.his_crm_system.exception.ResourceNotFoundException 404 */
    InvoiceResponse get(Long id);
}
