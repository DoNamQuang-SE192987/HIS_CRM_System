package org.quangdn.his_crm_system.dto.respone;

import org.quangdn.his_crm_system.entity.PurchaseOrder;
import org.quangdn.his_crm_system.enums.PurchaseOrderStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record PurchaseOrderDetailResponse(
        Long id,
        String code,
        SupplierResponse supplier,
        PurchaseOrderStatus status,
        LocalDate orderDate,
        LocalDate expectedDate,
        String note,
        List<PurchaseOrderItemResponse> items,
        int totalQty,
        Instant createdAt,
        Instant receivedAt
) {

    public static PurchaseOrderDetailResponse from(PurchaseOrder po) {
        List<PurchaseOrderItemResponse> items = po.getItems().stream().map(PurchaseOrderItemResponse::from).toList();
        return new PurchaseOrderDetailResponse(po.getId(), po.getCode(), SupplierResponse.from(po.getSupplier()),
                po.getStatus(), po.getOrderDate(), po.getExpectedDate(), po.getNote(), items,
                items.stream().mapToInt(PurchaseOrderItemResponse::qty).sum(), po.getCreatedAt(), po.getReceivedAt());
    }
}
