package org.quangdn.his_crm_system.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.quangdn.his_crm_system.enums.OrderStatus;
import org.quangdn.his_crm_system.enums.SalesChannel;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Sales order (đơn bán). Named SalesOrder because ORDER is a reserved word in SQL/JPQL.
 * Every order doubles as its invoice: invoice number is derived from {@link #code}.
 */
@Entity
@Table(name = "sales_orders", uniqueConstraints = {
        @UniqueConstraint(name = "uk_sales_orders_code", columnNames = "code"),
        // the same marketplace order must not be imported twice
        @UniqueConstraint(name = "uk_sales_orders_channel_external_no", columnNames = {"channel", "external_order_no"})
})
@Getter
@Setter
@NoArgsConstructor
public class SalesOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Human order number, e.g. SO-2026-0001. Built from the generated id right after INSERT (same transaction),
     * hence nullable at DB level - the service guarantees it is set before commit.
     */
    @Column(length = 30)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SalesChannel channel;

    /** Marketplace order number (Walmart / Amazon). Null for wholesale. */
    @Column(name = "external_order_no", length = 50)
    private String externalOrderNo;

    /**
     * Who we invoice. Wholesale: the business customer. Marketplace: the shared marketplace account
     * ("Walmart Marketplace") - the individual buyer is only stored on the order ({@link #recipientName}).
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    /** Person / company receiving the goods, e.g. the Walmart buyer "Elizabeth Lopez". */
    @Column(nullable = false)
    private String recipientName;

    /** Snapshot of the addresses at order time - later customer edits must not rewrite old invoices. */
    @Column(nullable = false, length = 500)
    private String shipTo;

    @Column(length = 500)
    private String billTo;

    @Column(nullable = false)
    private LocalDate orderDate;

    /** Ship-by deadline (marketplace SLA). Optional for wholesale. */
    private LocalDate shipBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.NEW;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(length = 500)
    private String note;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id")
    private List<OrderItem> items = new ArrayList<>();

    private Instant shippedAt;

    private Instant canceledAt;

    @Version
    private Long version;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    public void addItem(OrderItem item) {
        item.setOrder(this);
        items.add(item);
    }

    /** NEW and past the ship-by date. */
    public boolean isOverdue(LocalDate today) {
        return status == OrderStatus.NEW && shipBy != null && shipBy.isBefore(today);
    }
}
