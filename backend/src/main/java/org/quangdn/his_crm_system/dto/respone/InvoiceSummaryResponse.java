package org.quangdn.his_crm_system.dto.respone;

import org.quangdn.his_crm_system.entity.Invoice;

import java.time.LocalDate;

/** Invoice reference shown on the order detail (null there when no invoice has been issued yet). */
public record InvoiceSummaryResponse(
        Long id,
        String invoiceNo,
        LocalDate invoiceDate,
        LocalDate dueDate,
        Integer paymentTermDays
) {

    public static InvoiceSummaryResponse from(Invoice invoice) {
        return invoice == null ? null : new InvoiceSummaryResponse(invoice.getId(), invoice.getInvoiceNo(),
                invoice.getInvoiceDate(), invoice.getDueDate(), invoice.getPaymentTermDays());
    }
}
