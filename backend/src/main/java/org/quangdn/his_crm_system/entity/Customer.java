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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.quangdn.his_crm_system.enums.SalesChannel;

import java.time.Instant;

/**
 * Who we invoice.
 * <ul>
 *     <li>Wholesale customer: a business that buys repeatedly ({@code marketplaceChannel = null}).</li>
 *     <li>Marketplace account: exactly one per marketplace ("Walmart Marketplace"), created by the system.
 *         Individual marketplace buyers are NOT customers - they live on the order as recipient + ship-to.</li>
 * </ul>
 */
@Entity
@Table(name = "customers", uniqueConstraints =
        @UniqueConstraint(name = "uk_customers_marketplace_channel", columnNames = "marketplace_channel"))
@Getter
@Setter
@NoArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 30)
    private String phone;

    private String email;

    /** Default delivery / billing address, used when a wholesale order does not specify one. */
    @Column(length = 500)
    private String address;

    /** Invoice payment term, e.g. 30 = "Net 30". 0 = due on receipt. */
    @Column(nullable = false)
    private Integer paymentTermDays = 0;

    /** Set only on the system marketplace accounts (WALMART / AMAZON); null for wholesale customers. */
    @Enumerated(EnumType.STRING)
    @Column(name = "marketplace_channel", length = 20)
    private SalesChannel marketplaceChannel;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Instant updatedAt;

    public boolean isMarketplaceAccount() {
        return marketplaceChannel != null;
    }
}
