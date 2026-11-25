package org.quangdn.his_crm_system.exception;

import org.quangdn.his_crm_system.dto.respone.StockShortageResponse;
import org.springframework.http.HttpStatus;

import java.util.List;

/** 409 - not enough stock to ship an order. {@code details} lists every short line, not just the first. */
public class InsufficientStockException extends AppException {

    public InsufficientStockException(String orderCode, List<StockShortageResponse> shortages) {
        super(HttpStatus.CONFLICT, "INSUFFICIENT_STOCK",
                "Không đủ tồn kho để giao đơn " + orderCode, List.copyOf(shortages));
    }
}
