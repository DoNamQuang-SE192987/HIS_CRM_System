package org.quangdn.his_crm_system.dto.respone;

import org.quangdn.his_crm_system.entity.OrderItem;

import java.math.BigDecimal;

/**
 * Order line with live stock info so the warehouse can see before shipping whether the order can go out.
 *
 * @param availableStock current on-hand stock of the product (live, not a snapshot)
 * @param enoughStock    availableStock &gt;= qty
 */
public record OrderItemResponse(
        Long id,
        Long productId,
        String sku,
        String productName,
        String packSize,
        Integer qty,
        BigDecimal unitPrice,
        BigDecimal lineTotal,
        Integer availableStock,
        boolean enoughStock
) {

    public static OrderItemResponse from(OrderItem item) {
        int available = item.getProduct().getStockQty();
        return new OrderItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getSku(),
                item.getProductName(),
                item.getPackSize(),
                item.getQty(),
                item.getUnitPrice(),
                item.getLineTotal(),
                available,
                available >= item.getQty()
        );
    }
}
