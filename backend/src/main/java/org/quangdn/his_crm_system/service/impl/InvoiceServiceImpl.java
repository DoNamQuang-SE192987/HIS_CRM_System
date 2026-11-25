package org.quangdn.his_crm_system.service.impl;

import lombok.RequiredArgsConstructor;
import org.quangdn.his_crm_system.config.CompanyProperties;
import org.quangdn.his_crm_system.dto.respone.InvoiceResponse;
import org.quangdn.his_crm_system.entity.Invoice;
import org.quangdn.his_crm_system.entity.SalesOrder;
import org.quangdn.his_crm_system.enums.OrderStatus;
import org.quangdn.his_crm_system.exception.InvalidStatusException;
import org.quangdn.his_crm_system.exception.ResourceNotFoundException;
import org.quangdn.his_crm_system.repository.InvoiceRepository;
import org.quangdn.his_crm_system.repository.SalesOrderRepository;
import org.quangdn.his_crm_system.service.InvoiceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final SalesOrderRepository orderRepository;
    private final CompanyProperties company;
    private final Clock clock;

    @Transactional
    @Override
    public IssueResult issueForOrder(Long orderId) {
        // Lock the order: two clicks on "Create invoice" (or invoice vs cancel) run one after the other,
        // so the second one sees the first invoice instead of creating a duplicate.
        SalesOrder order = orderRepository.findByIdForUpdate(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        if (order.getStatus() == OrderStatus.CANCELED) {
            throw new InvalidStatusException("Cannot invoice order %s: it is CANCELED".formatted(order.getCode()));
        }

        Optional<Invoice> existing = invoiceRepository.findByOrderId(orderId);
        if (existing.isPresent()) {
            return new IssueResult(InvoiceResponse.from(existing.get(), company), false);
        }

        LocalDate today = LocalDate.now(clock);
        int termDays = order.getCustomer().getPaymentTermDays();

        Invoice invoice = new Invoice();
        invoice.setOrder(order);
        invoice.setInvoiceNo(order.getCode().replaceFirst("^SO-", "INV-"));
        invoice.setInvoiceDate(today);
        invoice.setPaymentTermDays(termDays);
        invoice.setDueDate(today.plusDays(termDays));
        invoice.setTotal(order.getTotal());
        invoiceRepository.saveAndFlush(invoice);

        return new IssueResult(InvoiceResponse.from(invoice, company), true);
    }

    @Override
    public InvoiceResponse get(Long id) {
        return invoiceRepository.findDetailById(id)
                .map(invoice -> InvoiceResponse.from(invoice, company))
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));
    }
}
