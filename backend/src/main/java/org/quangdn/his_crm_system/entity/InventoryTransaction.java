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
import org.quangdn.his_crm_system.enums.InventoryRefType;
import org.quangdn.his_crm_system.enums.InventoryTransactionType;

import java.time.Instant;

/**
 * Stock ledger (thẻ kho) - append-only, written only by InventoryService. Replaces the warehouse's
 * per-date Excel columns. Invariant: for every product, SUM(quantity) = product.stockQty.
 */
@Entity
@Table(name = "inventory_transactions", indexes = {
        @Index(name = "idx_inv_tx_product", columnList = "product_id"),
        @Index(name = "idx_inv_tx_ref", columnList = "ref_type, ref_id"),
        @Index(name = "idx_inv_tx_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
public class InventoryTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InventoryTransactionType type;

    /** Signed: +IN, -OUT, -DAMAGED. */
    @Column(nullable = false)
    private Integer quantity;

    /** Product stock right after this movement - lets the ledger be audited without replaying it. */
    @Column(nullable = false)
    private Integer balanceAfter;

    @Enumerated(EnumType.STRING)
    @Column(name = "ref_type", nullable = false, length = 30)
    private InventoryRefType refType;

    /** Id of the source document (sales order / purchase order); null for MANUAL and OPENING_BALANCE. */
    @Column(name = "ref_id")
    private Long refId;

    /** Human code of the source document (SO-2026-0001 / PO-2026-0001), for display. */
    @Column(name = "ref_code", length = 30)
    private String refCode;

    /** Free note; for DAMAGED this is the (mandatory) reason. */
    @Column(length = 500)
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
