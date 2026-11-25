package org.quangdn.his_crm_system.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.quangdn.his_crm_system.enums.StockTransactionType;

import java.time.Instant;

/**
 * Stock ledger (thẻ kho) - append-only. Replaces the warehouse's per-date Excel columns:
 * every change of {@link Product#getStockQty()} writes exactly one row here.
 */
@Entity
@Table(name = "stock_transactions", indexes = {
        @Index(name = "idx_stock_tx_product", columnList = "product_id"),
        @Index(name = "idx_stock_tx_reference", columnList = "reference")
})
@Getter
@Setter
@NoArgsConstructor
public class StockTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StockTransactionType type;

    /** Always positive; the direction comes from {@link #type}. */
    @Column(nullable = false)
    private Integer quantity;

    /** Product stock right after this movement - lets the ledger be audited without replaying it. */
    @Column(nullable = false)
    private Integer balanceAfter;

    /** Source document: order code (SO-...), purchase order code (PO-...), damage report... */
    @Column(nullable = false, length = 50)
    private String reference;

    @Column(length = 500)
    private String note;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
