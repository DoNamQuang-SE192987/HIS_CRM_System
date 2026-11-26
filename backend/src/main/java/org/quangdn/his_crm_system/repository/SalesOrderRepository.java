package org.quangdn.his_crm_system.repository;

import jakarta.persistence.LockModeType;
import org.quangdn.his_crm_system.entity.SalesOrder;
import org.quangdn.his_crm_system.enums.OrderStatus;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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

    // ---------------------------------------------------------------- inventory

    /** Rows of [Long productId, Long qty]: units on NEW orders, i.e. sold but not shipped yet. */
    @Query("""
            select i.product.id, sum(i.qty) from OrderItem i
            where i.order.status = org.quangdn.his_crm_system.enums.OrderStatus.NEW
            group by i.product.id""")
    List<Object[]> sumQtyOnNewOrdersByProduct();

    /** productId -> units committed to NEW orders (products without open orders are absent = 0). */
    default Map<Long, Integer> committedQtyByProduct() {
        return sumQtyOnNewOrdersByProduct().stream()
                .collect(Collectors.toMap(row -> (Long) row[0], row -> ((Number) row[1]).intValue()));
    }

    // ---------------------------------------------------------------- dashboard

    long countByOrderDateAndStatusNot(LocalDate orderDate, OrderStatus status);

    /** Rows of [SalesChannel, Long count]. */
    @Query("select o.channel, count(o) from SalesOrder o where o.status = :status group by o.channel")
    List<Object[]> countByChannelForStatus(@Param("status") OrderStatus status);

    /** Revenue is recognised when goods leave the warehouse: SHIPPED orders by shippedAt. */
    @Query("""
            select coalesce(sum(o.total), 0) from SalesOrder o
            where o.status = org.quangdn.his_crm_system.enums.OrderStatus.SHIPPED
              and o.shippedAt >= :from and o.shippedAt < :to""")
    BigDecimal sumShippedRevenue(@Param("from") Instant from, @Param("to") Instant to);

    @EntityGraph(attributePaths = "customer")
    List<SalesOrder> findByStatusAndShipByBeforeOrderByShipByAsc(OrderStatus status, LocalDate date, Pageable pageable);

    long countByStatusAndShipByBefore(OrderStatus status, LocalDate date);
}
