package org.quangdn.his_crm_system.service.impl;

import lombok.RequiredArgsConstructor;
import org.quangdn.his_crm_system.dto.request.OrderFilter;
import org.quangdn.his_crm_system.dto.request.ProductFilter;
import org.quangdn.his_crm_system.dto.respone.DashboardSummaryResponse;
import org.quangdn.his_crm_system.dto.respone.InventoryItemResponse;
import org.quangdn.his_crm_system.dto.respone.OrderSummaryResponse;
import org.quangdn.his_crm_system.enums.OrderStatus;
import org.quangdn.his_crm_system.enums.SalesChannel;
import org.quangdn.his_crm_system.enums.StockStatus;
import org.quangdn.his_crm_system.repository.ProductRepository;
import org.quangdn.his_crm_system.repository.ProductSpecifications;
import org.quangdn.his_crm_system.repository.SalesOrderRepository;
import org.quangdn.his_crm_system.repository.SalesOrderSpecifications;
import org.quangdn.his_crm_system.service.DashboardService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final SalesOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final Clock clock;

    @Override
    public DashboardSummaryResponse summary() {
        LocalDate today = LocalDate.now(clock);
        ZoneId zone = clock.getZone();

        Map<SalesChannel, Long> toShipByChannel = new EnumMap<>(SalesChannel.class);
        for (SalesChannel channel : SalesChannel.values()) {
            toShipByChannel.put(channel, 0L);
        }
        for (Object[] row : orderRepository.countByChannelForStatus(OrderStatus.NEW)) {
            toShipByChannel.put((SalesChannel) row[0], (Long) row[1]);
        }
        long ordersToShip = toShipByChannel.values().stream().mapToLong(Long::longValue).sum();

        Instant monthStart = today.withDayOfMonth(1).atStartOfDay(zone).toInstant();
        Instant nextMonthStart = today.withDayOfMonth(1).plusMonths(1).atStartOfDay(zone).toInstant();
        BigDecimal revenue = orderRepository.sumShippedRevenue(monthStart, nextMonthStart);

        // active products needing a reorder (LOW / OUT, or not enough for open orders):
        // OUT first, then the biggest shortage
        Map<Long, Integer> committed = orderRepository.committedQtyByProduct();
        List<InventoryItemResponse> lowStock = productRepository
                .findAll(ProductSpecifications.filter(new ProductFilter(null, null, null, true)))
                .stream()
                .map(p -> InventoryItemResponse.from(p, committed.getOrDefault(p.getId(), 0)))
                .filter(InventoryItemResponse::needsReorder)
                .sorted(Comparator.comparing((InventoryItemResponse i) -> i.status() != StockStatus.OUT)
                        .thenComparing(InventoryItemResponse::shortage, Comparator.reverseOrder()))
                .toList();

        List<OrderSummaryResponse> overdue = orderRepository
                .findByStatusAndShipByBeforeOrderByShipByAsc(OrderStatus.NEW, today, PageRequest.of(0, LIST_LIMIT))
                .stream().map(o -> OrderSummaryResponse.from(o, today)).toList();

        List<OrderSummaryResponse> recent = orderRepository
                .findAll(SalesOrderSpecifications.filter(new OrderFilter(null, null, null)),
                        PageRequest.of(0, RECENT_ORDERS, Sort.by(Sort.Direction.DESC, "id")))
                .map(o -> OrderSummaryResponse.from(o, today))
                .getContent();

        return new DashboardSummaryResponse(
                orderRepository.countByOrderDateAndStatusNot(today, OrderStatus.CANCELED),
                ordersToShip,
                toShipByChannel,
                revenue,
                lowStock.size(),
                orderRepository.countByStatusAndShipByBefore(OrderStatus.NEW, today),
                overdue,
                lowStock.stream().limit(LIST_LIMIT).toList(),
                recent,
                Instant.now(clock)
        );
    }
}
