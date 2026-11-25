package org.quangdn.his_crm_system.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.quangdn.his_crm_system.enums.SalesChannel;

import java.time.LocalDate;
import java.util.List;

/**
 * Body of {@code POST /orders}.
 * <ul>
 *     <li>{@code externalOrderNo}: required for WALMART / AMAZON, must be empty for WHOLESALE (checked in service)</li>
 *     <li>{@code shipTo} / {@code billTo}: fall back to the customer's address when empty</li>
 *     <li>Prices are NOT accepted from the client - unit prices are snapshotted from the catalogue</li>
 * </ul>
 */
public record OrderCreateRequest(
        @NotNull SalesChannel channel,
        @Size(max = 50) String externalOrderNo,
        @NotNull Long customerId,
        @Size(max = 500) String shipTo,
        @Size(max = 500) String billTo,
        LocalDate shipBy,
        @Size(max = 500) String note,
        @NotEmpty @Size(max = 100) List<@Valid @NotNull OrderItemRequest> items
) {
}
