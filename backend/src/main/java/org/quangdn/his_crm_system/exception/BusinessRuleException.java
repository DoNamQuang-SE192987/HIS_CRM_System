package org.quangdn.his_crm_system.exception;

import org.springframework.http.HttpStatus;

/** 422 - the request is well-formed but violates a business rule. */
public class BusinessRuleException extends AppException {

    public BusinessRuleException(String message) {
        super(HttpStatus.UNPROCESSABLE_CONTENT, "BUSINESS_RULE_VIOLATION", message);
    }
}
