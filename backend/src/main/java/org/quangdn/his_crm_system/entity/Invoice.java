package org.quangdn.his_crm_system.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Invoice issued for a sales order - at most one per order (enforced by {@code uk_invoices_order}).
 * <p>
 * Header values (dates, payment term, total) are frozen at issue time. Lines, addresses and recipient are read from
 * the order, whose items and addresses are already snapshots that never change after creation.
 */
@Entity
@Table(name = "invoices", uniqueConstraints = {
        @UniqueConstraint(name = "uk_invoices_invoice_no", columnNames = "invoice_no"),
        @UniqueConstraint(name = "uk_invoices_order", columnNames = "order_id")
})
@Getter
@Setter
@NoArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** INV-2026-0015 for order SO-2026-0015 - one-to-one, easy to cross-reference. */
    @Column(name = "invoice_no", nullable = false, length = 30)
    private String invoiceNo;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private SalesOrder order;

    @Column(nullable = false)
    private LocalDate invoiceDate;

    /** Customer's payment term at issue time (later changes to the customer do not affect this invoice). */
    @Column(nullable = false)
    private Integer paymentTermDays;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal total;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
