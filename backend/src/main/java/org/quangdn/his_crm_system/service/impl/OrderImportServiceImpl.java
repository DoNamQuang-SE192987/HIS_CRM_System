package org.quangdn.his_crm_system.service.impl;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.quangdn.his_crm_system.dto.request.OrderCreateRequest;
import org.quangdn.his_crm_system.dto.request.OrderItemRequest;
import org.quangdn.his_crm_system.dto.respone.OrderDetailResponse;
import org.quangdn.his_crm_system.dto.respone.OrderImportResponse;
import org.quangdn.his_crm_system.dto.respone.OrderImportResponse.OrderResult;
import org.quangdn.his_crm_system.entity.Product;
import org.quangdn.his_crm_system.entity.SalesOrder;
import org.quangdn.his_crm_system.enums.ImportResultStatus;
import org.quangdn.his_crm_system.enums.SalesChannel;
import org.quangdn.his_crm_system.exception.AppException;
import org.quangdn.his_crm_system.exception.DuplicateResourceException;
import org.quangdn.his_crm_system.exception.RequestValidationException;
import org.quangdn.his_crm_system.repository.ProductRepository;
import org.quangdn.his_crm_system.repository.SalesOrderRepository;
import org.quangdn.his_crm_system.service.OrderImportService;
import org.quangdn.his_crm_system.service.OrderService;
import org.quangdn.his_crm_system.util.CsvParser;
import org.quangdn.his_crm_system.util.CsvParser.Row;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Not {@code @Transactional} on purpose: each order goes through {@link OrderService#create}, which runs in its own
 * transaction, so a failing order rolls back alone.
 */
@Service
@RequiredArgsConstructor
public class OrderImportServiceImpl implements OrderImportService {

    private static final String IMPORT_NOTE = "Imported from marketplace CSV";

    private static final List<DateTimeFormatter> DATE_FORMATS = List.of(
            DateTimeFormatter.ISO_LOCAL_DATE,            // 2025-09-26 (also prefix of 2025-09-26T10:00:00Z)
            DateTimeFormatter.ofPattern("M/d/yyyy"),     // 09/26/2025 - Walmart / US Excel
            DateTimeFormatter.ofPattern("M/d/yy")
    );

    /** Logical columns and the header names accepted for each (compared after {@link #normalize}). */
    private enum Column {
        ORDER_NO("order", "ordernumber", "orderno", "orderid", "customerorderid", "amazonorderid"),
        ORDER_DATE("orderdate", "purchasedate"),
        SHIP_BY("shipby", "shipbydate", "latestshipdate", "promisedate"),
        RECIPIENT("customer", "customername", "recipient", "recipientname", "shiptoname", "buyername"),
        SHIP_TO("shipto", "shiptoaddress", "shippingaddress", "address"),
        ADDRESS_1("shipaddress1", "address1", "addressline1", "shiptoaddress1"),
        ADDRESS_2("shipaddress2", "address2", "addressline2", "shiptoaddress2"),
        CITY("shipcity", "city", "shiptocity"),
        STATE("shipstate", "state", "shiptostate"),
        ZIP("shippostalcode", "postalcode", "zip", "zipcode", "shiptozip"),
        BILL_TO("billto", "billtoaddress", "billingaddress"),
        SKU("sku", "itemsku", "sellersku", "itemnumber"),
        QTY("qty", "quantity", "quantitypurchased", "quantityordered");

        private final Set<String> aliases;

        Column(String... aliases) {
            this.aliases = Set.of(aliases);
        }
    }

    private final OrderService orderService;
    private final SalesOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final Validator validator;

    @Override
    public OrderImportResponse importCsv(SalesChannel channel, String csvContent) {
        if (channel == null || !channel.isMarketplace()) {
            throw new RequestValidationException("channel", "must be a marketplace channel (WALMART or AMAZON)");
        }
        List<Row> rows = CsvParser.parse(csvContent == null ? "" : csvContent);
        if (rows.size() < 2) {
            throw new RequestValidationException("file", "contains no order rows (expected a header line + data)");
        }
        if (rows.size() - 1 > MAX_DATA_ROWS) {
            throw new RequestValidationException("file", "has more than " + MAX_DATA_ROWS + " rows; split it into smaller files");
        }
        Map<Column, Integer> columns = mapHeader(rows.getFirst());

        List<OrderResult> results = new ArrayList<>();
        Map<String, List<Row>> byOrderNo = new LinkedHashMap<>();
        for (Row row : rows.subList(1, rows.size())) {
            String orderNo = value(row, columns, Column.ORDER_NO);
            if (orderNo.isEmpty()) {
                results.add(failed(null, List.of(row), "missing order number"));
            } else {
                byOrderNo.computeIfAbsent(orderNo, key -> new ArrayList<>()).add(row);
            }
        }

        Map<String, Product> productsBySku = loadProducts(rows, columns);
        byOrderNo.forEach((orderNo, orderRows) ->
                results.add(importOrder(channel, orderNo, orderRows, columns, productsBySku)));

        return OrderImportResponse.of(channel, results);
    }

    @Override
    public String template() {
        return """
                Order#,Order Date,Ship By,Customer Name,Ship To Address,Bill To Address,SKU,Qty
                200013751032753,2025-09-26,2025-09-29,Elizabeth Lopez,"12002 Fairpoint Dr, Houston, TX 77099","1927 Lombardy St, Houston, TX 77023",LNS264,1
                200013746358302,2025-09-26,2025-09-29,soo yoon hwang,"8800 Bellaire Blvd, Houston, TX 77036",,LNS217,2
                200013746358302,2025-09-26,2025-09-29,soo yoon hwang,"8800 Bellaire Blvd, Houston, TX 77036",,LNS246,1
                """;
    }

    // ---------------------------------------------------------------- one order

    private OrderResult importOrder(SalesChannel channel, String orderNo, List<Row> rows,
                                    Map<Column, Integer> columns, Map<String, Product> productsBySku) {
        Optional<SalesOrder> existing = orderRepository.findByChannelAndExternalOrderNo(channel, orderNo);
        if (existing.isPresent()) {
            return result(orderNo, rows, ImportResultStatus.SKIPPED, existing.get().getId(), existing.get().getCode(),
                    "already in the system as " + existing.get().getCode());
        }

        List<String> problems = new ArrayList<>();
        Map<Long, Integer> qtyByProduct = new LinkedHashMap<>();
        for (Row row : rows) {
            String sku = value(row, columns, Column.SKU).toUpperCase(Locale.ROOT);
            Product product = productsBySku.get(sku);
            if (sku.isEmpty()) {
                problems.add("line %d: missing SKU".formatted(row.lineNumber()));
            } else if (product == null) {
                problems.add("line %d: unknown SKU '%s'".formatted(row.lineNumber(), sku));
            }
            Integer qty = parseQty(value(row, columns, Column.QTY));
            if (qty == null) {
                problems.add("line %d: quantity must be a whole number >= 1".formatted(row.lineNumber()));
            }
            if (product != null && qty != null) {
                qtyByProduct.merge(product.getId(), qty, Integer::sum);   // same SKU twice -> one line
            }
        }

        Row first = rows.getFirst();
        LocalDate orderDate = parseDate(value(first, columns, Column.ORDER_DATE), "order date", first, problems);
        LocalDate shipBy = parseDate(value(first, columns, Column.SHIP_BY), "ship-by date", first, problems);
        if (!problems.isEmpty()) {
            return failed(orderNo, rows, String.join("; ", problems));
        }

        OrderCreateRequest request = new OrderCreateRequest(
                channel,
                orderNo,
                null,                                   // billed to the marketplace account
                blankToNull(value(first, columns, Column.RECIPIENT)),
                shipToAddress(first, columns),
                blankToNull(value(first, columns, Column.BILL_TO)),
                orderDate,
                shipBy,
                IMPORT_NOTE,
                qtyByProduct.entrySet().stream().map(e -> new OrderItemRequest(e.getKey(), e.getValue())).toList()
        );

        Set<ConstraintViolation<OrderCreateRequest>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            return failed(orderNo, rows, violations.stream()
                    .map(v -> v.getPropertyPath() + " " + v.getMessage())
                    .sorted()
                    .collect(Collectors.joining("; ")));
        }

        try {
            OrderDetailResponse created = orderService.create(request);
            return result(orderNo, rows, ImportResultStatus.CREATED, created.id(), created.code(), null);
        } catch (RequestValidationException ex) {
            return failed(orderNo, rows, ex.getFieldErrors().entrySet().stream()
                    .map(e -> e.getKey() + " " + e.getValue())
                    .collect(Collectors.joining("; ")));
        } catch (DuplicateResourceException ex) {
            // another user imported the same order a moment ago
            return result(orderNo, rows, ImportResultStatus.SKIPPED, null, null, ex.getMessage());
        } catch (AppException ex) {
            return failed(orderNo, rows, ex.getMessage());
        } catch (DataIntegrityViolationException ex) {
            return failed(orderNo, rows, "conflicts with existing data");
        }
    }

    // ---------------------------------------------------------------- header / values

    private static Map<Column, Integer> mapHeader(Row header) {
        Map<Column, Integer> columns = new EnumMap<>(Column.class);
        for (int i = 0; i < header.cells().size(); i++) {
            String name = normalize(header.get(i));
            for (Column column : Column.values()) {
                if (column.aliases.contains(name)) {
                    columns.putIfAbsent(column, i);
                }
            }
        }

        List<String> missing = new ArrayList<>();
        if (!columns.containsKey(Column.ORDER_NO)) missing.add("Order#");
        if (!columns.containsKey(Column.SKU)) missing.add("SKU");
        if (!columns.containsKey(Column.QTY)) missing.add("Qty");
        if (!columns.containsKey(Column.RECIPIENT)) missing.add("Customer Name");
        if (!columns.containsKey(Column.SHIP_TO) && !columns.containsKey(Column.ADDRESS_1)) missing.add("Ship To Address");
        if (!missing.isEmpty()) {
            throw new RequestValidationException("file", "missing required column(s): " + String.join(", ", missing)
                    + ". Download GET /orders/import/template for the expected format");
        }
        return columns;
    }

    /** "Ship To Address" column, or "address1, address2, city, state zip" assembled from split columns (Amazon). */
    private static String shipToAddress(Row row, Map<Column, Integer> columns) {
        String full = value(row, columns, Column.SHIP_TO);
        if (!full.isEmpty()) {
            return full;
        }
        String stateZip = Stream.of(value(row, columns, Column.STATE), value(row, columns, Column.ZIP))
                .filter(s -> !s.isEmpty()).collect(Collectors.joining(" "));
        String assembled = Stream.of(value(row, columns, Column.ADDRESS_1), value(row, columns, Column.ADDRESS_2),
                        value(row, columns, Column.CITY), stateZip)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.joining(", "));
        return blankToNull(assembled);
    }

    private Map<String, Product> loadProducts(List<Row> rows, Map<Column, Integer> columns) {
        Set<String> skus = rows.subList(1, rows.size()).stream()
                .map(row -> value(row, columns, Column.SKU).toUpperCase(Locale.ROOT))
                .filter(sku -> !sku.isEmpty())
                .collect(Collectors.toSet());
        return productRepository.findBySkuIn(skus).stream()
                .collect(Collectors.toMap(Product::getSku, Function.identity()));
    }

    private static String value(Row row, Map<Column, Integer> columns, Column column) {
        Integer index = columns.get(column);
        return index == null ? "" : row.get(index);
    }

    /** "Order #" -> "order", "quantity-purchased" -> "quantitypurchased". */
    private static String normalize(String header) {
        return header.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
    }

    private static Integer parseQty(String raw) {
        try {
            int qty = Integer.parseInt(raw.replace(",", "").trim());
            return qty >= 1 ? qty : null;
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private static LocalDate parseDate(String raw, String label, Row row, List<String> problems) {
        if (raw.isEmpty()) {
            return null;
        }
        String candidate = raw.length() > 10 && raw.charAt(4) == '-' ? raw.substring(0, 10) : raw;  // strip time part
        for (DateTimeFormatter format : DATE_FORMATS) {
            try {
                return LocalDate.parse(candidate, format);
            } catch (DateTimeParseException ignored) {
                // try the next format
            }
        }
        problems.add("line %d: invalid %s '%s' (use yyyy-MM-dd or MM/dd/yyyy)".formatted(row.lineNumber(), label, raw));
        return null;
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static OrderResult failed(String orderNo, List<Row> rows, String message) {
        return result(orderNo, rows, ImportResultStatus.FAILED, null, null, message);
    }

    private static OrderResult result(String orderNo, List<Row> rows, ImportResultStatus status,
                                      Long orderId, String orderCode, String message) {
        return new OrderResult(orderNo, rows.stream().map(Row::lineNumber).toList(), status, orderId, orderCode, message);
    }
}
