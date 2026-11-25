package org.quangdn.his_crm_system.repository;

import org.quangdn.his_crm_system.entity.Invoice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByOrderId(Long orderId);

    /** Print view: invoice + order + customer + lines in one round trip. */
    @EntityGraph(attributePaths = {"order", "order.customer", "order.items"})
    @Query("select i from Invoice i where i.id = :id")
    Optional<Invoice> findDetailById(@Param("id") Long id);
}
