package org.quangdn.his_crm_system.repository;

import jakarta.persistence.criteria.Predicate;
import org.quangdn.his_crm_system.entity.Customer;
import org.quangdn.his_crm_system.enums.SalesChannel;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** Dynamic WHERE clause for {@code GET /customers}. */
public final class CustomerSpecifications {

    private static final char LIKE_ESCAPE = '\\';

    private CustomerSpecifications() {
    }

    /**
     * @param q       name or phone contains (case-insensitive); ignored when blank
     * @param channel WHOLESALE = wholesale customers only; WALMART / AMAZON = that marketplace account; null = all
     */
    public static Specification<Customer> filter(String q, SalesChannel channel) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (q != null && !q.isBlank()) {
                String pattern = "%" + escapeLike(q.trim().toLowerCase(Locale.ROOT)) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), pattern, LIKE_ESCAPE),
                        cb.like(root.get("phone"), pattern, LIKE_ESCAPE)
                ));
            }
            if (channel != null) {
                predicates.add(channel.isMarketplace()
                        ? cb.equal(root.get("marketplaceChannel"), channel)
                        : cb.isNull(root.get("marketplaceChannel")));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
