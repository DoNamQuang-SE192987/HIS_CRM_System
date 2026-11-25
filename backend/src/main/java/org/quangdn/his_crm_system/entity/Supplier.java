package org.quangdn.his_crm_system.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Vendor we buy stock from (nhà cung cấp). Seeded master data in the MVP. */
@Entity
@Table(name = "suppliers")
@Getter
@Setter
@NoArgsConstructor
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String contactName;

    @Column(length = 30)
    private String phone;

    private String email;

    @Column(length = 500)
    private String address;

    /** Typical days from ordering to delivery - lets the warehouse reorder early enough. */
    private Integer leadTimeDays;
}
