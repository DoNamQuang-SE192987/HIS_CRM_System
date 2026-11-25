package org.quangdn.his_crm_system.repository;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.quangdn.his_crm_system.dto.request.OrderFilter;
import org.quangdn.his_crm_system.entity.Customer;
import org.quangdn.his_crm_system.entity.SalesOrder;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** Dynamic WHERE clause for {@code GET /orders}. Null / blank filters are ignored. */
public final class SalesOrderSpecifications {

    private static final char LIKE_ESCAPE = '\\';

    private SalesOrderSpecifications() {
    }

    public static Specification<SalesOrder> filter(OrderFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.status() != null) {
                predicates.add(cb.equal(root.get("status"), filter.status()));
            }
            if (filter.channel() != null) {
                predicates.add(cb.equal(root.get("channel"), filter.channel()));
            }
            if (filter.q() != null && !filter.q().isBlank()) {
                String pattern = "%" + escapeLike(filter.q().trim().toLowerCase(Locale.ROOT)) + "%";
                Join<SalesOrder, Customer> customer = root.join("customer", JoinType.INNER);
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("code")), pattern, LIKE_ESCAPE),
                        cb.like(cb.lower(root.get("externalOrderNo")), pattern, LIKE_ESCAPE),
                        cb.like(cb.lower(customer.get("name")), pattern, LIKE_ESCAPE),
                        cb.like(cb.lower(root.get("recipientName")), pattern, LIKE_ESCAPE)
                ));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
