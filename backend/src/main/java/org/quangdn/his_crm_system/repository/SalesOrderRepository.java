package org.quangdn.his_crm_system.repository;

import jakarta.persistence.LockModeType;
import org.quangdn.his_crm_system.entity.SalesOrder;
import org.quangdn.his_crm_system.enums.SalesChannel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long>, JpaSpecificationExecutor<SalesOrder> {

    /** List page: customer fetched in the same query (no N+1). */
    @Override
    @EntityGraph(attributePaths = "customer")
    Page<SalesOrder> findAll(Specification<SalesOrder> spec, Pageable pageable);

    /** Detail page: order + customer + lines + their products in one round trip. */
    @EntityGraph(attributePaths = {"customer", "items", "items.product"})
    @Query("select o from SalesOrder o where o.id = :id")
    Optional<SalesOrder> findDetailById(@Param("id") Long id);

    /**
     * Locks the order row so ship / cancel on the same order are serialized:
     * the second caller waits, then sees the new status and gets INVALID_STATUS.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from SalesOrder o where o.id = :id")
    Optional<SalesOrder> findByIdForUpdate(@Param("id") Long id);

    Optional<SalesOrder> findByChannelAndExternalOrderNo(SalesChannel channel, String externalOrderNo);
}
