package org.quangdn.his_crm_system.enums;

/**
 * Kind of stock movement. Quantity sign: IN is positive, OUT and DAMAGED are negative,
 * so the sum of all quantities of a product always equals its stockQty.
 */
public enum InventoryTransactionType {
    /** Goods received (purchase order, manual stock-in, opening balance). */
    IN,
    /** Goods shipped on a sales order. */
    OUT,
    /** Goods written off (hàng huỷ): broken, expired, leaking... */
    DAMAGED
}
