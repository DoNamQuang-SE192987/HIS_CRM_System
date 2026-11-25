package org.quangdn.his_crm_system.dto.respone;

import org.quangdn.his_crm_system.entity.SalesOrder;
import org.quangdn.his_crm_system.enums.OrderStatus;
import org.quangdn.his_crm_system.enums.SalesChannel;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Row of the order list. {@code overdue} = still NEW after the ship-by date. */
public record OrderSummaryResponse(
        Long id,
        String code,
        SalesChannel channel,
        String externalOrderNo,
        Long customerId,
        String customerName,
        String recipientName,
        LocalDate orderDate,
        LocalDate shipBy,
        BigDecimal total,
        OrderStatus status,
        boolean overdue
) {

    public static OrderSummaryResponse from(SalesOrder o, LocalDate today) {
        return new OrderSummaryResponse(
                o.getId(),
                o.getCode(),
                o.getChannel(),
                o.getExternalOrderNo(),
                o.getCustomer().getId(),
                o.getCustomer().getName(),
                o.getRecipientName(),
                o.getOrderDate(),
                o.getShipBy(),
                o.getTotal(),
                o.getStatus(),
                o.isOverdue(today)
        );
    }
}
