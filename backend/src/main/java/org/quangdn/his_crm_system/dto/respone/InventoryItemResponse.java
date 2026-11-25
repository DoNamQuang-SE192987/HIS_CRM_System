package org.quangdn.his_crm_system.dto.respone;

import org.quangdn.his_crm_system.entity.Product;
import org.quangdn.his_crm_system.enums.PriceUnit;
import org.quangdn.his_crm_system.enums.StockStatus;

/**
 * Row of the stock table.
 *
 * @param shortage units missing to get back to minStock (0 when IN_STOCK) - a reorder hint for the PO form
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
        StockStatus status,
        int shortage,
        boolean active
) {

    public static InventoryItemResponse from(Product p) {
        return new InventoryItemResponse(p.getId(), p.getSku(), p.getName(), p.getBrand(), p.getPackSize(),
                p.getPriceUnit(), p.getStockQty(), p.getMinStock(), p.getStockStatus(),
                Math.max(0, p.getMinStock() - p.getStockQty()), p.isActive());
    }
}
