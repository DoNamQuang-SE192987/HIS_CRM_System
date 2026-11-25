package org.quangdn.his_crm_system.dto.respone;

import org.quangdn.his_crm_system.entity.Product;
import org.quangdn.his_crm_system.enums.PriceUnit;
import org.quangdn.his_crm_system.enums.StockStatus;

import java.math.BigDecimal;
import java.time.Instant;

public record ProductResponse(
        Long id,
        String sku,
        String name,
        String brand,
        String packSize,
        String packDescription,
        Integer unitsPerCarton,
        BigDecimal price,
        PriceUnit priceUnit,
        Integer stockQty,
        Integer minStock,
        StockStatus stockStatus,
        String imageUrl,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {

    public static ProductResponse from(Product p) {
        return new ProductResponse(
                p.getId(),
                p.getSku(),
                p.getName(),
                p.getBrand(),
                p.getPackSize(),
                p.getPackDescription(),
                p.getUnitsPerCarton(),
                p.getPrice(),
                p.getPriceUnit(),
                p.getStockQty(),
                p.getMinStock(),
                p.getStockStatus(),
                p.getImageUrl(),
                p.isActive(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
