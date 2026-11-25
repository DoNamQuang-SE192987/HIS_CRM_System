package org.quangdn.his_crm_system.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** One PO line: quantity is in the product unit (cartons / bags). */
public record PurchaseOrderItemRequest(
        @NotNull Long productId,
        @NotNull @Min(value = 1, message = "must be at least 1") @Max(1_000_000) Integer qty
) {
}
