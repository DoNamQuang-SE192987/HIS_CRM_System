package org.quangdn.his_crm_system.exception;

import org.springframework.http.HttpStatus;

/** 403 - caller's role is not allowed to perform the action. */
public class ForbiddenException extends AppException {

    public ForbiddenException(String message) {
        super(HttpStatus.FORBIDDEN, "FORBIDDEN", message);
    }
}
