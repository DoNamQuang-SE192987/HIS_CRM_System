package org.quangdn.his_crm_system.dto.respone;

import org.quangdn.his_crm_system.entity.PurchaseOrderItem;
import org.quangdn.his_crm_system.enums.StockStatus;

/**
 * PO line plus the live stock of the product, so the warehouse sees why it was ordered.
 * currentStock / minStock / stockStatus are live values, not snapshots.
 */
public record PurchaseOrderItemResponse(
        Long id,
        Long productId,
        String sku,
        String productName,
        Integer qty,
        Integer currentStock,
        Integer minStock,
        StockStatus stockStatus
) {

    public static PurchaseOrderItemResponse from(PurchaseOrderItem item) {
        return new PurchaseOrderItemResponse(item.getId(), item.getProduct().getId(), item.getSku(),
                item.getProductName(), item.getQty(), item.getProduct().getStockQty(),
                item.getProduct().getMinStock(), item.getProduct().getStockStatus());
    }
}
