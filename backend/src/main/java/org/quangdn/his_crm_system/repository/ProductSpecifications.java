package org.quangdn.his_crm_system.repository;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.quangdn.his_crm_system.dto.request.ProductFilter;
import org.quangdn.his_crm_system.entity.Product;
import org.quangdn.his_crm_system.enums.StockStatus;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** Dynamic WHERE clause for {@code GET /products}. Null / blank filters are ignored. */
public final class ProductSpecifications {

    private static final char LIKE_ESCAPE = '\\';

    private ProductSpecifications() {
    }

    public static Specification<Product> filter(ProductFilter filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.q() != null && !filter.q().isBlank()) {
                String pattern = "%" + escapeLike(filter.q().trim().toLowerCase(Locale.ROOT)) + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("sku")), pattern, LIKE_ESCAPE),
                        cb.like(cb.lower(root.get("name")), pattern, LIKE_ESCAPE)
                ));
            }
            if (filter.brand() != null && !filter.brand().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("brand")), filter.brand().trim().toLowerCase(Locale.ROOT)));
            }
            if (filter.stockStatus() != null) {
                predicates.add(stockStatus(root, cb, filter.stockStatus()));
            }
            if (filter.active() != null) {
                predicates.add(cb.equal(root.get("active"), filter.active()));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    /** Must stay in sync with {@link StockStatus#of(int, int)}. */
    private static Predicate stockStatus(Root<Product> root, CriteriaBuilder cb, StockStatus status) {
        Path<Integer> qty = root.get("stockQty");
        Path<Integer> min = root.get("minStock");
        return switch (status) {
            case OUT -> cb.le(qty, 0);
            case LOW -> cb.and(cb.gt(qty, 0), cb.lt(qty, min));
            case IN_STOCK -> cb.and(cb.gt(qty, 0), cb.ge(qty, min));
        };
    }

    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
