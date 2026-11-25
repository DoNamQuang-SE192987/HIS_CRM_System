package org.quangdn.his_crm_system.dto.respone;

import org.quangdn.his_crm_system.entity.SalesOrder;
import org.quangdn.his_crm_system.enums.OrderStatus;
import org.quangdn.his_crm_system.enums.SalesChannel;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * Full order - also everything the invoice print page needs (every order has an invoice).
 *
 * @param invoiceNo       derived from the order code: SO-2026-0001 -> INV-2026-0001
 * @param paymentTermDays customer's payment term; invoice due date = orderDate + paymentTermDays
 * @param canShip         status is NEW and every line has enough stock
 */
public record OrderDetailResponse(
        Long id,
        String code,
        String invoiceNo,
        SalesChannel channel,
        String externalOrderNo,
        CustomerResponse customer,
        String shipTo,
        String billTo,
        LocalDate orderDate,
        LocalDate shipBy,
        Integer paymentTermDays,
        LocalDate dueDate,
        OrderStatus status,
        boolean overdue,
        boolean canShip,
        BigDecimal total,
        String note,
        List<OrderItemResponse> items,
        Instant createdAt,
        Instant shippedAt,
        Instant canceledAt
) {

    public static OrderDetailResponse from(SalesOrder o, LocalDate today) {
        List<OrderItemResponse> items = o.getItems().stream().map(OrderItemResponse::from).toList();
        int termDays = o.getCustomer().getPaymentTermDays();
        boolean canShip = o.getStatus() == OrderStatus.NEW && items.stream().allMatch(OrderItemResponse::enoughStock);
        return new OrderDetailResponse(
                o.getId(),
                o.getCode(),
                o.getCode().replaceFirst("^SO-", "INV-"),
                o.getChannel(),
                o.getExternalOrderNo(),
                CustomerResponse.from(o.getCustomer()),
                o.getShipTo(),
                o.getBillTo(),
                o.getOrderDate(),
                o.getShipBy(),
                termDays,
                o.getOrderDate().plusDays(termDays),
                o.getStatus(),
                o.isOverdue(today),
                canShip,
                o.getTotal(),
                o.getNote(),
                items,
                o.getCreatedAt(),
                o.getShippedAt(),
                o.getCanceledAt()
        );
    }
}
