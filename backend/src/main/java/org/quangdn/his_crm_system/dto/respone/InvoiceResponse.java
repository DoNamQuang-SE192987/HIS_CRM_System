package org.quangdn.his_crm_system.dto.respone;

import org.quangdn.his_crm_system.config.CompanyProperties;
import org.quangdn.his_crm_system.entity.Invoice;
import org.quangdn.his_crm_system.entity.OrderItem;
import org.quangdn.his_crm_system.entity.SalesOrder;
import org.quangdn.his_crm_system.enums.OrderStatus;
import org.quangdn.his_crm_system.enums.SalesChannel;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.IntStream;

/**
 * Everything the invoice print page needs - the frontend only lays it out.
 *
 * @param externalOrderNo marketplace order no (Walmart "Order #"), null for wholesale
 * @param customerName    who is invoiced: the wholesale customer, or the marketplace account
 * @param recipientName   who receives the goods (printed in Ship To)
 * @param voided          the order was canceled after the invoice was issued - print as VOID
 */
public record InvoiceResponse(
        Long id,
        String invoiceNo,
        LocalDate invoiceDate,
        LocalDate dueDate,
        Integer paymentTermDays,
        boolean voided,
        Company company,
        Long orderId,
        String orderCode,
        LocalDate orderDate,
        SalesChannel channel,
        String externalOrderNo,
        String customerName,
        String recipientName,
        String shipTo,
        String billTo,
        List<Line> lines,
        BigDecimal total,
        String currency
) {

    public record Company(String name, String address, String phone, String email) {
    }

    /** @param amount qty x unitPrice */
    public record Line(int lineNo, Integer qty, String sku, String description, String packSize,
                       BigDecimal unitPrice, BigDecimal amount) {
    }

    public static InvoiceResponse from(Invoice invoice, CompanyProperties company) {
        SalesOrder order = invoice.getOrder();
        List<OrderItem> items = order.getItems();
        List<Line> lines = IntStream.range(0, items.size())
                .mapToObj(i -> {
                    OrderItem item = items.get(i);
                    return new Line(i + 1, item.getQty(), item.getSku(), item.getProductName(), item.getPackSize(),
                            item.getUnitPrice(), item.getLineTotal());
                })
                .toList();

        return new InvoiceResponse(
                invoice.getId(),
                invoice.getInvoiceNo(),
                invoice.getInvoiceDate(),
                invoice.getDueDate(),
                invoice.getPaymentTermDays(),
                order.getStatus() == OrderStatus.CANCELED,
                new Company(company.name(), company.address(), company.phone(), company.email()),
                order.getId(),
                order.getCode(),
                order.getOrderDate(),
                order.getChannel(),
                order.getExternalOrderNo(),
                order.getCustomer().getName(),
                order.getRecipientName(),
                order.getShipTo(),
                // marketplace orders may have no separate billing address - bill to the recipient's address
                order.getBillTo() != null ? order.getBillTo() : order.getShipTo(),
                lines,
                invoice.getTotal(),
                "USD"
        );
    }
}
