package org.quangdn.his_crm_system.repository;

import org.quangdn.his_crm_system.entity.InventoryTransaction;
import org.quangdn.his_crm_system.enums.InventoryRefType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InventoryTransactionRepository
        extends JpaRepository<InventoryTransaction, Long>, JpaSpecificationExecutor<InventoryTransaction> {

    /** History page: product fetched in the same query (no N+1). */
    @Override
    @EntityGraph(attributePaths = "product")
    Page<InventoryTransaction> findAll(Specification<InventoryTransaction> spec, Pageable pageable);

    List<InventoryTransaction> findByRefTypeAndRefIdOrderByIdAsc(InventoryRefType refType, Long refId);

    /** Ledger total of a product - must always equal product.stockQty. */
    @Query("select coalesce(sum(t.quantity), 0) from InventoryTransaction t where t.product.id = :productId")
    long sumQuantityByProductId(@Param("productId") Long productId);
}
