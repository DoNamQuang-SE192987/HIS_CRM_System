package org.quangdn.his_crm_system.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

/** Body of {@code POST /purchase-orders}. Each product may appear only once. */
public record PurchaseOrderCreateRequest(
        @NotNull Long supplierId,
        LocalDate expectedDate,
        @Size(max = 500) String note,
        @NotEmpty @Size(max = 100) List<@Valid @NotNull PurchaseOrderItemRequest> items
) {
}
