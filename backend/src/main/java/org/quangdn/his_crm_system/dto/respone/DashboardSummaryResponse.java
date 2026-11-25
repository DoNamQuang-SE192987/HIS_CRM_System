package org.quangdn.his_crm_system.dto.respone;

import org.quangdn.his_crm_system.enums.SalesChannel;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Everything the manager dashboard needs, in one call.
 *
 * @param ordersToday       orders dated today, excluding canceled ones
 * @param ordersToShip      NEW orders waiting for the warehouse
 * @param ordersToShipByChannel breakdown of ordersToShip (every channel present, 0 when none)
 * @param revenueThisMonth  total of orders SHIPPED this calendar month (by ship date)
 * @param lowStockCount     active products that are LOW or OUT
 * @param overdueCount      NEW orders past their ship-by date (overdueOrders is capped, this is not)
 * @param overdueOrders     most overdue first, at most {@code DashboardService.LIST_LIMIT}
 * @param lowStockProducts  OUT first, then by largest shortage, at most {@code DashboardService.LIST_LIMIT}
 * @param recentOrders      5 newest orders
 */
public record DashboardSummaryResponse(
        long ordersToday,
        long ordersToShip,
        Map<SalesChannel, Long> ordersToShipByChannel,
        BigDecimal revenueThisMonth,
        long lowStockCount,
        long overdueCount,
        List<OrderSummaryResponse> overdueOrders,
        List<InventoryItemResponse> lowStockProducts,
        List<OrderSummaryResponse> recentOrders,
        Instant generatedAt
) {
}
