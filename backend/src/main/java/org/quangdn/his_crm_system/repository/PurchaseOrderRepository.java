package org.quangdn.his_crm_system.repository;

import jakarta.persistence.LockModeType;
import org.quangdn.his_crm_system.entity.PurchaseOrder;
import org.quangdn.his_crm_system.enums.PurchaseOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    /** List pages (items are batch-loaded, see PurchaseOrder#items). */
    @Override
    @EntityGraph(attributePaths = "supplier")
    Page<PurchaseOrder> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "supplier")
    Page<PurchaseOrder> findByStatus(PurchaseOrderStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"supplier", "items", "items.product"})
    @Query("select po from PurchaseOrder po where po.id = :id")
    Optional<PurchaseOrder> findDetailById(@Param("id") Long id);

    /** Serializes two "receive" clicks on the same PO: the second one sees RECEIVED and gets 409. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select po from PurchaseOrder po where po.id = :id")
    Optional<PurchaseOrder> findByIdForUpdate(@Param("id") Long id);
}
