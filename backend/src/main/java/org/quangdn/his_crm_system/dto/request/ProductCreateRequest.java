package org.quangdn.his_crm_system.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.quangdn.his_crm_system.enums.PriceUnit;

import java.math.BigDecimal;

/**
 * Body of {@code POST /products}.
 *
 * @param stockQty optional opening balance when onboarding an existing product (defaults to 0).
 *                 After creation stock only changes through warehouse operations.
 */
public record ProductCreateRequest(
        @NotBlank @Size(max = 50) String sku,
        @NotBlank @Size(max = 255) String name,
        @Size(max = 100) String brand,
        @Size(max = 100) String packSize,
        @Size(max = 255) String packDescription,
        @NotNull @Min(value = 1, message = "must be at least 1") Integer unitsPerCarton,
        @NotNull @DecimalMin(value = "0", inclusive = false, message = "must be greater than 0")
        @Digits(integer = 10, fraction = 2) BigDecimal price,
        PriceUnit priceUnit,
        @Min(0) Integer minStock,
        @Min(0) Integer stockQty,
        @Size(max = 1000) String imageUrl
) {
}
