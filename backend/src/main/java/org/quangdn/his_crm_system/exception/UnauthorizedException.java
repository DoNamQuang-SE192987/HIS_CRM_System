package org.quangdn.his_crm_system.exception;

import org.springframework.http.HttpStatus;

/** 401 - caller did not identify a (valid) role. */
public class UnauthorizedException extends AppException {

    public UnauthorizedException(String message) {
        super(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", message);
    }
}
