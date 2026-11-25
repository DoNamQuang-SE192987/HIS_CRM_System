package org.quangdn.his_crm_system.repository;

import jakarta.persistence.criteria.Predicate;
import org.quangdn.his_crm_system.entity.InventoryTransaction;
import org.quangdn.his_crm_system.enums.InventoryTransactionType;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** Dynamic WHERE clause for {@code GET /inventory/transactions}. Null filters are ignored. */
public final class InventoryTransactionSpecifications {

    private InventoryTransactionSpecifications() {
    }

    /**
     * @param fromInclusive createdAt &gt;= this instant
     * @param toExclusive   createdAt &lt; this instant
     */
    public static Specification<InventoryTransaction> filter(Long productId, InventoryTransactionType type,
                                                             Instant fromInclusive, Instant toExclusive) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (productId != null) {
                predicates.add(cb.equal(root.get("product").get("id"), productId));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (fromInclusive != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), fromInclusive));
            }
            if (toExclusive != null) {
                predicates.add(cb.lessThan(root.get("createdAt"), toExclusive));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
