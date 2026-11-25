package org.quangdn.his_crm_system.exception;

import org.springframework.http.HttpStatus;

/** 409 - a unique business key (SKU, marketplace order no...) is already taken. */
public class DuplicateResourceException extends AppException {

    public DuplicateResourceException(String message) {
        super(HttpStatus.CONFLICT, "DUPLICATE_RESOURCE", message);
    }
}
