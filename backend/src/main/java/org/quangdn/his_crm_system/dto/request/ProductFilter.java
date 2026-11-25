package org.quangdn.his_crm_system.dto.request;

import org.quangdn.his_crm_system.enums.StockStatus;

/**
 * Query filters for the product list.
 *
 * @param q           matches SKU or name (case-insensitive, contains)
 * @param brand       exact brand (case-insensitive)
 * @param stockStatus derived stock status
 * @param active      true = selling, false = discontinued, null = both
 */
public record ProductFilter(String q, String brand, StockStatus stockStatus, Boolean active) {
}
