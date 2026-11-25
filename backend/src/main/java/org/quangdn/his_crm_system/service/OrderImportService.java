package org.quangdn.his_crm_system.service;

import org.quangdn.his_crm_system.dto.respone.OrderImportResponse;
import org.quangdn.his_crm_system.enums.SalesChannel;

/**
 * Bulk-creates marketplace orders from the CSV / TSV order export of Walmart Seller Center or Amazon Seller Central,
 * replacing manual re-typing of every marketplace order.
 */
public interface OrderImportService {

    int MAX_DATA_ROWS = 5_000;

    /**
     * Rows are grouped by marketplace order no (one order may span several rows = several SKUs).
     * Each order is created in its own transaction: one bad order never blocks the others.
     * Orders already in the system are SKIPPED, so the same file can be uploaded again safely.
     *
     * @throws org.quangdn.his_crm_system.exception.RequestValidationException channel is not a marketplace,
     *                                                                          file empty / too large / missing columns
     */
    OrderImportResponse importCsv(SalesChannel channel, String csvContent);

    /** Example CSV with the recommended header, for users to download and fill. */
    String template();
}
