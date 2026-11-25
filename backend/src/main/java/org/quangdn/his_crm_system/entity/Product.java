package org.quangdn.his_crm_system.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.quangdn.his_crm_system.enums.PriceUnit;
import org.quangdn.his_crm_system.enums.StockStatus;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "products", uniqueConstraints = @UniqueConstraint(name = "uk_products_sku", columnNames = "sku"))
@Getter
@Setter
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Business key, stored trimmed + upper-cased. */
    @Column(nullable = false, length = 50)
    private String sku;

    @Column(nullable = false)
    private String name;

    @Column(length = 100)
    private String brand;

    /** Short pack size, e.g. "320ml x 24". */
    @Column(length = 100)
    private String packSize;

    /** Full pack description, e.g. "320ML x 24 cans / carton". */
    private String packDescription;

    /** Sellable units inside one carton / bag (>= 1). */
    @Column(nullable = false)
    private Integer unitsPerCarton;

    /** Wholesale price per {@link #priceUnit}. */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PriceUnit priceUnit = PriceUnit.CARTON;

    /**
     * On-hand quantity in {@link #priceUnit}s.
     * Only changed by warehouse operations (stock in / sales out / damaged), never by the product edit API.
     */
    @Column(nullable = false)
    private Integer stockQty = 0;

    /** Reorder threshold: below this the product is LOW stock. */
    @Column(nullable = false)
    private Integer minStock = 0;

    @Column(length = 1000)
    private String imageUrl;

    /** false = discontinued; cannot be put on new orders. */
    @Column(nullable = false)
    private boolean active = true;

    /** Optimistic lock - protects stockQty from lost updates once stock movements exist. */
    @Version
    private Long version;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    public StockStatus getStockStatus() {
        return StockStatus.of(stockQty, minStock);
    }
}
