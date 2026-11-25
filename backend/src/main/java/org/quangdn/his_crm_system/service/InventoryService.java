package org.quangdn.his_crm_system.service;

import org.quangdn.his_crm_system.dto.request.DamagedStockRequest;
import org.quangdn.his_crm_system.dto.request.InventoryTransactionFilter;
import org.quangdn.his_crm_system.dto.request.StockInRequest;
import org.quangdn.his_crm_system.dto.respone.InventoryItemResponse;
import org.quangdn.his_crm_system.dto.respone.InventoryTransactionResponse;
import org.quangdn.his_crm_system.dto.respone.PageResponse;
import org.quangdn.his_crm_system.entity.Product;
import org.quangdn.his_crm_system.entity.PurchaseOrder;
import org.quangdn.his_crm_system.entity.SalesOrder;
import org.quangdn.his_crm_system.enums.StockStatus;

import java.util.List;

/**
 * The ONLY component allowed to change {@code Product.stockQty}. Every change writes exactly one
 * inventory transaction in the same DB transaction, so for every product
 * {@code stockQty == SUM(inventory_transactions.quantity)} and stock never goes negative.
 */
public interface InventoryService {

    int DEFAULT_PAGE_SIZE = 20;
    int MAX_PAGE_SIZE = 100;

    // ---------------------------------------------------------------- warehouse screens

    /** Stock table sorted by SKU. @param q SKU / name filter; @param status IN_STOCK / LOW / OUT filter */
    List<InventoryItemResponse> list(String q, StockStatus status);

    /** Ledger, newest first. @param page 1-based */
    PageResponse<InventoryTransactionResponse> transactions(InventoryTransactionFilter filter, int page, int size);

    /** Manual receipt: IN + MANUAL. */
    InventoryTransactionResponse stockIn(StockInRequest request);

    /**
     * Write-off: DAMAGED + MANUAL, reason stored as note.
     *
     * @throws org.quangdn.his_crm_system.exception.InsufficientStockException 409 if qty &gt; current stock
     */
    InventoryTransactionResponse recordDamaged(DamagedStockRequest request);

    // ---------------------------------------------------------------- called by other services (same transaction)

    /** Initial stock of a just-created product: IN + OPENING_BALANCE. */
    void recordOpeningBalance(Product product, int qty);

    /**
     * Deducts every line of a sales order: locks the products (id order), checks all lines first,
     * then writes one OUT + SALES_ORDER per product. Nothing is changed if any line is short.
     *
     * @throws org.quangdn.his_crm_system.exception.InsufficientStockException 409, lists every short product
     */
    void shipSalesOrder(SalesOrder order);

    /** Adds every line of a purchase order: IN + PURCHASE_ORDER per product. */
    void receivePurchaseOrder(PurchaseOrder purchaseOrder);
}
