package org.quangdn.his_crm_system.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.quangdn.his_crm_system.dto.respone.ApiError;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** All business exceptions: status, code and details come from the exception itself. */
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiError> handleApp(AppException ex, HttpServletRequest request) {
        Map<String, String> fieldErrors = ex instanceof RequestValidationException rve ? rve.getFieldErrors() : null;
        return build(ex.getStatus(), ex.getCode(), ex.getMessage(), ex.getDetails(), fieldErrors, request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Validation failed", null, fieldErrors, request);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        String message = "Invalid value '%s' for parameter '%s'".formatted(ex.getValue(), ex.getName());
        return build(HttpStatus.BAD_REQUEST, "BAD_REQUEST", message, null, null, request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, "BAD_REQUEST", "Malformed request body", null, null, request);
    }

    /** Safety net for races the service-level checks cannot see (e.g. two concurrent creates with the same SKU). */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleIntegrity(DataIntegrityViolationException ex, HttpServletRequest request) {
        log.warn("Data integrity violation on {}", request.getRequestURI(), ex);
        return build(HttpStatus.CONFLICT, "CONFLICT", "Request conflicts with existing data", null, null, request);
    }

    @ExceptionHandler({ObjectOptimisticLockingFailureException.class, PessimisticLockingFailureException.class})
    public ResponseEntity<ApiError> handleConcurrency(RuntimeException ex, HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, "CONCURRENT_MODIFICATION",
                "The record was modified by someone else, please reload and retry", null, null, request);
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String code, String message, Object details,
                                           Map<String, String> fieldErrors, HttpServletRequest request) {
        ApiError body = new ApiError(code, message, details, fieldErrors, status.value(), request.getRequestURI(),
                Instant.now());
        return ResponseEntity.status(status).body(body);
    }
}
