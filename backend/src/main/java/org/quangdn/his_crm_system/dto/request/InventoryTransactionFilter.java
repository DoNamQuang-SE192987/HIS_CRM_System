package org.quangdn.his_crm_system.dto.request;

import org.quangdn.his_crm_system.enums.InventoryTransactionType;

import java.time.LocalDate;

/**
 * Filters of {@code GET /inventory/transactions}. All optional.
 *
 * @param from first day included (business time zone)
 * @param to   last day included
 */
public record InventoryTransactionFilter(Long productId, InventoryTransactionType type, LocalDate from, LocalDate to) {
}
