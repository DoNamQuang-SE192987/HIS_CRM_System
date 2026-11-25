package org.quangdn.his_crm_system.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Body of {@code POST /inventory/stock-in}: manual receipt without a purchase order (e.g. returned goods). */
public record StockInRequest(
        @NotNull Long productId,
        @NotNull @Min(value = 1, message = "must be at least 1") @Max(1_000_000) Integer qty,
        @Size(max = 500) String note
) {
}
