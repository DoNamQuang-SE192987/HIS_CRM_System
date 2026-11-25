package org.quangdn.his_crm_system.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Body of {@code POST /customers}.
 *
 * @param address         default ship-to / bill-to used when an order leaves them empty
 * @param paymentTermDays invoice term ("Net 30" = 30); defaults to 0 (due on receipt)
 */
public record CustomerCreateRequest(
        @NotBlank @Size(max = 255) String name,
        @Size(max = 30) String phone,
        @Email @Size(max = 255) String email,
        @Size(max = 500) String address,
        @Min(0) @Max(365) Integer paymentTermDays
) {
}
