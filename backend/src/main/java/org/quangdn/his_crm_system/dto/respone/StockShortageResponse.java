package org.quangdn.his_crm_system.dto.respone;

/** One line of the INSUFFICIENT_STOCK error details. */
public record StockShortageResponse(String sku, int required, int available) {
}
