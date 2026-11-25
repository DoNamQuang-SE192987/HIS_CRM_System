package org.quangdn.his_crm_system.dto.respone;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.quangdn.his_crm_system.enums.ImportResultStatus;
import org.quangdn.his_crm_system.enums.SalesChannel;

import java.util.List;

/**
 * Result of {@code POST /orders/import}: a summary plus one entry per marketplace order found in the file.
 */
public record OrderImportResponse(
        SalesChannel channel,
        int totalOrders,
        int created,
        int skipped,
        int failed,
        List<OrderResult> results
) {

    /**
     * @param lines     CSV line numbers this order came from (header = line 1)
     * @param orderId   created order id, or the existing one when SKIPPED
     * @param orderCode created / existing order code
     * @param message   reason for SKIPPED / FAILED
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record OrderResult(
            String externalOrderNo,
            List<Integer> lines,
            ImportResultStatus status,
            Long orderId,
            String orderCode,
            String message
    ) {
    }

    public static OrderImportResponse of(SalesChannel channel, List<OrderResult> results) {
        int created = count(results, ImportResultStatus.CREATED);
        int skipped = count(results, ImportResultStatus.SKIPPED);
        int failed = count(results, ImportResultStatus.FAILED);
        return new OrderImportResponse(channel, results.size(), created, skipped, failed, List.copyOf(results));
    }

    private static int count(List<OrderResult> results, ImportResultStatus status) {
        return (int) results.stream().filter(r -> r.status() == status).count();
    }
}
