package org.quangdn.his_crm_system.exception;

import org.quangdn.his_crm_system.dto.respone.StockShortageResponse;
import org.springframework.http.HttpStatus;

import java.util.List;

/** 409 - not enough stock. {@code details} lists every short product, not just the first. */
public class InsufficientStockException extends AppException {

    public InsufficientStockException(String message, List<StockShortageResponse> shortages) {
        super(HttpStatus.CONFLICT, "INSUFFICIENT_STOCK", message, List.copyOf(shortages));
    }

    public static InsufficientStockException forOrder(String orderCode, List<StockShortageResponse> shortages) {
        return new InsufficientStockException("Không đủ tồn kho để giao đơn " + orderCode, shortages);
    }
}
