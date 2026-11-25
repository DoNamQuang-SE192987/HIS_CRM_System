package org.quangdn.his_crm_system.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** One order line: quantity is in the product's price unit (cartons / bags). */
public record OrderItemRequest(
        @NotNull Long productId,
        @NotNull @Min(value = 1, message = "must be at least 1") @Max(100_000) Integer qty
) {
}
