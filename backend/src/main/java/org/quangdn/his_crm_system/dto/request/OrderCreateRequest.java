package org.quangdn.his_crm_system.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import org.quangdn.his_crm_system.enums.SalesChannel;

import java.time.LocalDate;
import java.util.List;

/**
 * Body of {@code POST /orders}. Rules checked in the service:
 * <ul>
 *     <li>WHOLESALE: {@code customerId} required (a wholesale customer); {@code externalOrderNo} must be empty;
 *         recipient / addresses fall back to the customer.</li>
 *     <li>WALMART / AMAZON: {@code externalOrderNo}, {@code recipientName} and {@code shipTo} required;
 *         {@code customerId} may be omitted - the order is billed to the marketplace account.</li>
 *     <li>Prices are NOT accepted from the client - unit prices are snapshotted from the catalogue.</li>
 * </ul>
 *
 * @param orderDate defaults to today; set when back-entering / importing marketplace orders
 */
public record OrderCreateRequest(
        @NotNull SalesChannel channel,
        @Size(max = 50) String externalOrderNo,
        Long customerId,
        @Size(max = 255) String recipientName,
        @Size(max = 500) String shipTo,
        @Size(max = 500) String billTo,
        @PastOrPresent LocalDate orderDate,
        LocalDate shipBy,
        @Size(max = 500) String note,
        @NotEmpty @Size(max = 100) List<@Valid @NotNull OrderItemRequest> items
) {
}
