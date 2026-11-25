package org.quangdn.his_crm_system.enums;

/**
 * Derived from {@code stockQty} vs {@code minStock} - never stored.
 * <ul>
 *     <li>OUT: stockQty &lt;= 0</li>
 *     <li>LOW: 0 &lt; stockQty &lt; minStock (time to raise a purchase order)</li>
 *     <li>IN_STOCK: stockQty &gt; 0 and stockQty &gt;= minStock</li>
 * </ul>
 */
public enum StockStatus {
    IN_STOCK,
    LOW,
    OUT;

    public static StockStatus of(int stockQty, int minStock) {
        if (stockQty <= 0) {
            return OUT;
        }
        return stockQty < minStock ? LOW : IN_STOCK;
    }
}
