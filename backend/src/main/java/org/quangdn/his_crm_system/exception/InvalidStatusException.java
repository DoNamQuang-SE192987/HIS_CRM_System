package org.quangdn.his_crm_system.exception;

import org.springframework.http.HttpStatus;

/** 409 - the action is not allowed in the resource's current status (e.g. shipping a CANCELED order). */
public class InvalidStatusException extends AppException {

    public InvalidStatusException(String message) {
        super(HttpStatus.CONFLICT, "INVALID_STATUS", message);
    }
}
