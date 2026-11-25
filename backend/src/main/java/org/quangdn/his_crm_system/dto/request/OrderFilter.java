package org.quangdn.his_crm_system.dto.request;

import org.quangdn.his_crm_system.enums.OrderStatus;
import org.quangdn.his_crm_system.enums.SalesChannel;

/**
 * Query filters for the order list.
 *
 * @param q matches order code, marketplace order no or customer name (case-insensitive, contains)
 */
public record OrderFilter(OrderStatus status, SalesChannel channel, String q) {
}
