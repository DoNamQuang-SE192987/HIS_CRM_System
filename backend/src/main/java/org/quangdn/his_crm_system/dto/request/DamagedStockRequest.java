package org.quangdn.his_crm_system.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Body of {@code POST /inventory/damaged}: write off broken / expired goods (hàng huỷ). Reason is mandatory. */
public record DamagedStockRequest(
        @NotNull Long productId,
        @NotNull @Min(value = 1, message = "must be at least 1") @Max(1_000_000) Integer qty,
        @NotBlank @Size(max = 500) String reason
) {
}
