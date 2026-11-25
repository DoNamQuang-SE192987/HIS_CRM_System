package org.quangdn.his_crm_system.dto.respone;

import org.quangdn.his_crm_system.entity.Invoice;
import org.quangdn.his_crm_system.entity.SalesOrder;
import org.quangdn.his_crm_system.enums.OrderStatus;
import org.quangdn.his_crm_system.enums.SalesChannel;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Full order.
 *
 * @param invoice the issued invoice, or null when {@code POST /orders/{id}/invoice} has not been called yet
 * @param canShip status is NEW and every line has enough stock
 */
public record OrderDetailResponse(
        Long id,
        String code,
        SalesChannel channel,
        String externalOrderNo,
        CustomerResponse customer,
        String recipientName,
        String shipTo,
        String billTo,
        LocalDate orderDate,
        LocalDate shipBy,
        OrderStatus status,
        boolean overdue,
        boolean canShip,
        BigDecimal total,
        String note,
        List<OrderItemResponse> items,
        InvoiceSummaryResponse invoice,
        Instant createdAt,
        Instant shippedAt,
        Instant canceledAt
) {

    public static OrderDetailResponse from(SalesOrder o, Invoice invoice, LocalDate today) {
        List<OrderItemResponse> items = o.getItems().stream().map(OrderItemResponse::from).toList();
        boolean canShip = o.getStatus() == OrderStatus.NEW && items.stream().allMatch(OrderItemResponse::enoughStock);
        return new OrderDetailResponse(
                o.getId(),
                o.getCode(),
                o.getChannel(),
                o.getExternalOrderNo(),
                CustomerResponse.from(o.getCustomer()),
                o.getRecipientName(),
                o.getShipTo(),
                o.getBillTo(),
                o.getOrderDate(),
                o.getShipBy(),
                o.getStatus(),
                o.isOverdue(today),
                canShip,
                o.getTotal(),
                o.getNote(),
                items,
                InvoiceSummaryResponse.from(invoice),
                o.getCreatedAt(),
                o.getShippedAt(),
                o.getCanceledAt()
        );
    }
}
