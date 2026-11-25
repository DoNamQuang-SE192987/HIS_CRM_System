package org.quangdn.his_crm_system.dto.respone;

import org.quangdn.his_crm_system.entity.PurchaseOrder;
import org.quangdn.his_crm_system.entity.PurchaseOrderItem;
import org.quangdn.his_crm_system.enums.PurchaseOrderStatus;

import java.time.Instant;
import java.time.LocalDate;

/** Row of the PO list. */
public record PurchaseOrderSummaryResponse(
        Long id,
        String code,
        Long supplierId,
        String supplierName,
        PurchaseOrderStatus status,
        LocalDate orderDate,
        LocalDate expectedDate,
        int lineCount,
        int totalQty,
        Instant receivedAt
) {

    public static PurchaseOrderSummaryResponse from(PurchaseOrder po) {
        return new PurchaseOrderSummaryResponse(po.getId(), po.getCode(), po.getSupplier().getId(),
                po.getSupplier().getName(), po.getStatus(), po.getOrderDate(), po.getExpectedDate(),
                po.getItems().size(), po.getItems().stream().mapToInt(PurchaseOrderItem::getQty).sum(),
                po.getReceivedAt());
    }
}
