package org.quangdn.his_crm_system.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Base class of every business exception. Carries the HTTP status, a machine-readable {@code code}
 * and optional structured {@code details}, rendered as {@link org.quangdn.his_crm_system.dto.respone.ApiError}.
 */
@Getter
public abstract class AppException extends RuntimeException {

    private final HttpStatus status;
    private final String code;
    private final transient Object details;

    protected AppException(HttpStatus status, String code, String message) {
        this(status, code, message, null);
    }

    protected AppException(HttpStatus status, String code, String message, Object details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
    }
}
