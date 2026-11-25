package org.quangdn.his_crm_system.service;

import org.quangdn.his_crm_system.dto.request.PurchaseOrderCreateRequest;
import org.quangdn.his_crm_system.dto.respone.PageResponse;
import org.quangdn.his_crm_system.dto.respone.PurchaseOrderDetailResponse;
import org.quangdn.his_crm_system.dto.respone.PurchaseOrderSummaryResponse;
import org.quangdn.his_crm_system.enums.PurchaseOrderStatus;

/** Purchase orders (đơn nhập hàng): ORDERED -> RECEIVED. */
public interface PurchaseOrderService {

    int DEFAULT_PAGE_SIZE = 20;
    int MAX_PAGE_SIZE = 100;

    /** Newest first. @param status optional filter; @param page 1-based */
    PageResponse<PurchaseOrderSummaryResponse> search(PurchaseOrderStatus status, int page, int size);

    PurchaseOrderDetailResponse get(Long id);

    /** Creates an ORDERED PO. Does not touch stock. Discontinued products cannot be reordered (422). */
    PurchaseOrderDetailResponse create(PurchaseOrderCreateRequest request);

    /**
     * ORDERED -> RECEIVED: adds every line to stock (IN + PURCHASE_ORDER) and sets receivedAt, atomically.
     *
     * @throws org.quangdn.his_crm_system.exception.InvalidStatusException 409 if already RECEIVED
     */
    PurchaseOrderDetailResponse receive(Long id);
}
