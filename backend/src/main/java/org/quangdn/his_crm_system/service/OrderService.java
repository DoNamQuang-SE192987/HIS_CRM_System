package org.quangdn.his_crm_system.service;

import org.quangdn.his_crm_system.dto.request.OrderCreateRequest;
import org.quangdn.his_crm_system.dto.request.OrderFilter;
import org.quangdn.his_crm_system.dto.respone.OrderDetailResponse;
import org.quangdn.his_crm_system.dto.respone.OrderSummaryResponse;
import org.quangdn.his_crm_system.dto.respone.PageResponse;

/**
 * Sales order lifecycle: NEW -> SHIPPED | CANCELED.
 */
public interface OrderService {

    int DEFAULT_PAGE_SIZE = 20;
    int MAX_PAGE_SIZE = 100;

    /** Newest first. @param page 1-based; out-of-range values are clamped. */
    PageResponse<OrderSummaryResponse> search(OrderFilter filter, int page, int size);

    OrderDetailResponse get(Long id);

    /** Creates a NEW order with price snapshots. Does not touch stock. */
    OrderDetailResponse create(OrderCreateRequest request);

    /**
     * Ships a NEW order atomically: lock order + products, verify stock for every line,
     * deduct stock, write one OUT transaction per line, set SHIPPED. Any shortage rolls back everything.
     *
     * @throws org.quangdn.his_crm_system.exception.InsufficientStockException 409, lists every short line
     * @throws org.quangdn.his_crm_system.exception.InvalidStatusException     409, order is not NEW
     */
    OrderDetailResponse ship(Long id);

    /**
     * Cancels a NEW order. Stock is untouched (the MVP does not reserve stock on order creation).
     *
     * @throws org.quangdn.his_crm_system.exception.InvalidStatusException 409, order is not NEW
     */
    OrderDetailResponse cancel(Long id);
}
