package org.quangdn.his_crm_system.dto.respone;

import org.quangdn.his_crm_system.entity.Product;
import org.quangdn.his_crm_system.enums.PriceUnit;
import org.quangdn.his_crm_system.enums.StockStatus;

/**
 * Row of the stock table.
 *
 * @param committedQty units on NEW orders (sold, not shipped yet) - they will leave the warehouse
 * @param shortage     units to buy so every open order can ship and minStock is still left:
 *                     max(0, committedQty + minStock - stockQty) - the reorder hint for the PO form
 */
public record InventoryItemResponse(
        Long productId,
        String sku,
        String name,
        String brand,
        String packSize,
        PriceUnit unit,
        Integer stockQty,
        Integer minStock,
        int committedQty,
        StockStatus status,
        int shortage,
        boolean active
) {

    /** @param committedQty from {@code SalesOrderRepository.committedQtyByProduct()} */
    public static InventoryItemResponse from(Product p, int committedQty) {
        return new InventoryItemResponse(p.getId(), p.getSku(), p.getName(), p.getBrand(), p.getPackSize(),
                p.getPriceUnit(), p.getStockQty(), p.getMinStock(), committedQty, p.getStockStatus(),
                Math.max(0, committedQty + p.getMinStock() - p.getStockQty()), p.isActive());
    }

    /** True when open orders or minStock need more stock than is on hand (or the product is out). */
    public boolean needsReorder() {
        return status != StockStatus.IN_STOCK || shortage > 0;
    }
}
