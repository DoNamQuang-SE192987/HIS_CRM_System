package org.quangdn.his_crm_system.support;

import lombok.RequiredArgsConstructor;
import org.quangdn.his_crm_system.repository.CustomerRepository;
import org.quangdn.his_crm_system.repository.InventoryTransactionRepository;
import org.quangdn.his_crm_system.repository.InvoiceRepository;
import org.quangdn.his_crm_system.repository.ProductRepository;
import org.quangdn.his_crm_system.repository.PurchaseOrderRepository;
import org.quangdn.his_crm_system.repository.SalesOrderRepository;
import org.quangdn.his_crm_system.repository.SupplierRepository;
import org.springframework.stereotype.Component;

/** Empties every table in foreign-key order. All integration tests share one H2 database. */
@Component
@RequiredArgsConstructor
public class DatabaseCleaner {

    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final InvoiceRepository invoiceRepository;
    private final SalesOrderRepository salesOrderRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;

    public void clean() {
        inventoryTransactionRepository.deleteAllInBatch();
        invoiceRepository.deleteAllInBatch();
        salesOrderRepository.deleteAll();      // cascades to order items
        purchaseOrderRepository.deleteAll();   // cascades to PO items
        productRepository.deleteAllInBatch();
        customerRepository.deleteAllInBatch();
        supplierRepository.deleteAllInBatch();
    }
}
