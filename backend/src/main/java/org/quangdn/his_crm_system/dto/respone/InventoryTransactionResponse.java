package org.quangdn.his_crm_system.dto.respone;

import org.quangdn.his_crm_system.entity.InventoryTransaction;
import org.quangdn.his_crm_system.enums.InventoryRefType;
import org.quangdn.his_crm_system.enums.InventoryTransactionType;

import java.time.Instant;

/**
 * One ledger line.
 *
 * @param quantity signed: +IN, -OUT, -DAMAGED
 * @param refType  with refId: SALES_ORDER -> /orders/{refId}, PURCHASE_ORDER -> /purchase-orders/{refId};
 *                 MANUAL / OPENING_BALANCE have no document (refId null)
 * @param refCode  document code to display, e.g. SO-2026-0001
 */
public record InventoryTransactionResponse(
        Long id,
        Instant createdAt,
        Long productId,
        String sku,
        String productName,
        InventoryTransactionType type,
        Integer quantity,
        Integer balanceAfter,
        InventoryRefType refType,
        Long refId,
        String refCode,
        String note
) {

    public static InventoryTransactionResponse from(InventoryTransaction t) {
        return new InventoryTransactionResponse(t.getId(), t.getCreatedAt(), t.getProduct().getId(),
                t.getProduct().getSku(), t.getProduct().getName(), t.getType(), t.getQuantity(), t.getBalanceAfter(),
                t.getRefType(), t.getRefId(), t.getRefCode(), t.getNote());
    }
}
