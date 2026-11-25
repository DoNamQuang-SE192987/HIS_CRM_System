package org.quangdn.his_crm_system.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

import java.util.Map;

/**
 * 400 - cross-field validation done in the service layer (rules Bean Validation annotations cannot express,
 * e.g. "externalOrderNo is required for marketplace channels"). Rendered exactly like annotation errors.
 */
@Getter
public class RequestValidationException extends AppException {

    private final transient Map<String, String> fieldErrors;

    public RequestValidationException(String field, String message) {
        super(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Validation failed");
        this.fieldErrors = Map.of(field, message);
    }
}
