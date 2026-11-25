package org.quangdn.his_crm_system.dto.respone;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.Map;

/**
 * Uniform error body returned by every endpoint.
 *
 * @param code        machine-readable error code, e.g. INSUFFICIENT_STOCK, INVALID_STATUS, VALIDATION_ERROR
 * @param details     extra structured data for the code (e.g. list of stock shortages); omitted when empty
 * @param fieldErrors field name -> message, only present for validation errors
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        String code,
        String message,
        Object details,
        Map<String, String> fieldErrors,
        int status,
        String path,
        Instant timestamp
) {
}
