package org.quangdn.his_crm_system.enums;

/**
 * Source document of an inventory transaction. Together with refId the frontend builds a link:
 * SALES_ORDER -> /orders/{refId}, PURCHASE_ORDER -> /purchase-orders/{refId}. MANUAL / OPENING_BALANCE have no document.
 */
public enum InventoryRefType {
    SALES_ORDER,
    PURCHASE_ORDER,
    /** Manual stock-in or damage write-off done by the warehouse. */
    MANUAL,
    /** Stock that existed before the system went live (product created with an initial quantity). */
    OPENING_BALANCE
}
