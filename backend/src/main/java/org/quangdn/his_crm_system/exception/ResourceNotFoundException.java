package org.quangdn.his_crm_system.exception;

import org.springframework.http.HttpStatus;

/** 404 - the requested resource does not exist. */
public class ResourceNotFoundException extends AppException {

    public ResourceNotFoundException(String resource, Object id) {
        super(HttpStatus.NOT_FOUND, "NOT_FOUND", resource + " not found: " + id);
    }
}
