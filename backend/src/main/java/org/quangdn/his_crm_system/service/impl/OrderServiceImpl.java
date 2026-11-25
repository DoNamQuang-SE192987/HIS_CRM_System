package org.quangdn.his_crm_system.service.impl;

import lombok.RequiredArgsConstructor;
import org.quangdn.his_crm_system.dto.request.OrderCreateRequest;
import org.quangdn.his_crm_system.dto.request.OrderFilter;
import org.quangdn.his_crm_system.dto.request.OrderItemRequest;
import org.quangdn.his_crm_system.dto.respone.OrderDetailResponse;
import org.quangdn.his_crm_system.dto.respone.OrderSummaryResponse;
import org.quangdn.his_crm_system.dto.respone.PageResponse;
import org.quangdn.his_crm_system.dto.respone.StockShortageResponse;
import org.quangdn.his_crm_system.entity.Customer;
import org.quangdn.his_crm_system.entity.OrderItem;
import org.quangdn.his_crm_system.entity.Product;
import org.quangdn.his_crm_system.entity.SalesOrder;
import org.quangdn.his_crm_system.entity.StockTransaction;
import org.quangdn.his_crm_system.enums.OrderStatus;
import org.quangdn.his_crm_system.enums.StockTransactionType;
import org.quangdn.his_crm_system.exception.DuplicateResourceException;
import org.quangdn.his_crm_system.exception.InsufficientStockException;
import org.quangdn.his_crm_system.exception.InvalidStatusException;
import org.quangdn.his_crm_system.exception.RequestValidationException;
import org.quangdn.his_crm_system.exception.ResourceNotFoundException;
import org.quangdn.his_crm_system.repository.ProductRepository;
import org.quangdn.his_crm_system.repository.SalesOrderRepository;
import org.quangdn.his_crm_system.repository.SalesOrderSpecifications;
import org.quangdn.his_crm_system.repository.StockTransactionRepository;
import org.quangdn.his_crm_system.service.CustomerService;
import org.quangdn.his_crm_system.service.OrderService;
import org.quangdn.his_crm_system.service.ProductService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private final SalesOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final ProductService productService;
    private final CustomerService customerService;
    private final Clock clock;

    @Override
    public PageResponse<OrderSummaryResponse> search(OrderFilter filter, int page, int size) {
        int safePage = Math.max(page, 1) - 1;
        int safeSize = Math.clamp(size, 1, MAX_PAGE_SIZE);
        PageRequest pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "id"));
        LocalDate today = today();
        return PageResponse.from(
                orderRepository.findAll(SalesOrderSpecifications.filter(filter), pageable),
                order -> OrderSummaryResponse.from(order, today));
    }

    @Override
    public OrderDetailResponse get(Long id) {
        return OrderDetailResponse.from(findDetailOrThrow(id), today());
    }

    @Transactional
    @Override
    public OrderDetailResponse create(OrderCreateRequest request) {
        String externalOrderNo = validateExternalOrderNo(request);
        validateNoDuplicateProducts(request.items());

        Customer customer = customerService.getEntity(request.customerId());
        String shipTo = firstNonBlank(request.shipTo(), customer.getAddress());
        if (shipTo == null) {
            throw new RequestValidationException("shipTo", "is required (customer has no default address)");
        }

        SalesOrder order = new SalesOrder();
        order.setChannel(request.channel());
        order.setExternalOrderNo(externalOrderNo);
        order.setCustomer(customer);
        order.setShipTo(shipTo);
        order.setBillTo(firstNonBlank(request.billTo(), customer.getAddress()));
        order.setOrderDate(today());
        order.setShipBy(request.shipBy());
        order.setNote(trimToNull(request.note()));
        order.setStatus(OrderStatus.NEW);

        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemRequest line : request.items()) {
            // rejects unknown (404) and discontinued (422) products
            Product product = productService.getSellableProduct(line.productId());
            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setSku(product.getSku());
            item.setProductName(product.getName());
            item.setPackSize(product.getPackSize());
            item.setQty(line.qty());
            item.setUnitPrice(product.getPrice());
            item.setLineTotal(product.getPrice().multiply(BigDecimal.valueOf(line.qty())));
            order.addItem(item);
            total = total.add(item.getLineTotal());
        }
        order.setTotal(total);

        // INSERT first to obtain the id, then derive the human code from it (UPDATE in the same transaction).
        orderRepository.saveAndFlush(order);
        order.setCode("SO-%d-%04d".formatted(order.getOrderDate().getYear(), order.getId()));
        orderRepository.flush();

        return OrderDetailResponse.from(order, today());
    }

    @Transactional
    @Override
    public OrderDetailResponse ship(Long id) {
        SalesOrder order = orderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        requireNew(order, "ship", "shipped");

        // total qty per product (lines are unique per product today, but stay safe if that ever changes)
        Map<Long, Integer> requiredByProduct = order.getItems().stream()
                .collect(Collectors.toMap(i -> i.getProduct().getId(), OrderItem::getQty, Integer::sum, LinkedHashMap::new));

        Map<Long, Product> locked = productRepository.findAllByIdForUpdate(requiredByProduct.keySet()).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));

        List<StockShortageResponse> shortages = new ArrayList<>();
        requiredByProduct.forEach((productId, required) -> {
            Product product = locked.get(productId);
            if (product.getStockQty() < required) {
                shortages.add(new StockShortageResponse(product.getSku(), required, product.getStockQty()));
            }
        });
        if (!shortages.isEmpty()) {
            // nothing has been modified yet; the exception also rolls back the transaction
            throw new InsufficientStockException(order.getCode(), shortages);
        }

        List<StockTransaction> transactions = new ArrayList<>();
        requiredByProduct.forEach((productId, qty) -> {
            Product product = locked.get(productId);
            product.setStockQty(product.getStockQty() - qty);

            StockTransaction tx = new StockTransaction();
            tx.setProduct(product);
            tx.setType(StockTransactionType.OUT);
            tx.setQuantity(qty);
            tx.setBalanceAfter(product.getStockQty());
            tx.setReference(order.getCode());
            tx.setNote("Shipped order " + order.getCode());
            transactions.add(tx);
        });
        stockTransactionRepository.saveAll(transactions);

        order.setStatus(OrderStatus.SHIPPED);
        order.setShippedAt(Instant.now(clock));
        orderRepository.flush();

        return OrderDetailResponse.from(order, today());
    }

    @Transactional
    @Override
    public OrderDetailResponse cancel(Long id) {
        SalesOrder order = orderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        requireNew(order, "cancel", "canceled");

        order.setStatus(OrderStatus.CANCELED);
        order.setCanceledAt(Instant.now(clock));
        orderRepository.flush();

        return OrderDetailResponse.from(order, today());
    }

    // ---------------------------------------------------------------- helpers

    private SalesOrder findDetailOrThrow(Long id) {
        return orderRepository.findDetailById(id).orElseThrow(() -> new ResourceNotFoundException("Order", id));
    }

    private static void requireNew(SalesOrder order, String action, String pastTense) {
        if (order.getStatus() != OrderStatus.NEW) {
            throw new InvalidStatusException("Cannot %s order %s: status is %s, only NEW orders can be %s"
                    .formatted(action, order.getCode(), order.getStatus(), pastTense));
        }
    }

    /** Marketplace orders must carry the marketplace order no (unique per channel); wholesale must not. */
    private String validateExternalOrderNo(OrderCreateRequest request) {
        String externalOrderNo = trimToNull(request.externalOrderNo());
        if (request.channel().isMarketplace()) {
            if (externalOrderNo == null) {
                throw new RequestValidationException("externalOrderNo", "is required for " + request.channel() + " orders");
            }
            orderRepository.findByChannelAndExternalOrderNo(request.channel(), externalOrderNo).ifPresent(existing -> {
                throw new DuplicateResourceException("%s order %s was already entered as %s"
                        .formatted(request.channel(), externalOrderNo, existing.getCode()));
            });
        } else if (externalOrderNo != null) {
            throw new RequestValidationException("externalOrderNo", "must be empty for WHOLESALE orders");
        }
        return externalOrderNo;
    }

    private static void validateNoDuplicateProducts(List<OrderItemRequest> items) {
        Set<Long> seen = new HashSet<>();
        for (OrderItemRequest item : items) {
            if (!seen.add(item.productId())) {
                throw new RequestValidationException("items",
                        "product " + item.productId() + " appears more than once; merge the quantities into one line");
            }
        }
    }

    private LocalDate today() {
        return LocalDate.now(clock);
    }

    private static String firstNonBlank(String preferred, String fallback) {
        String value = trimToNull(preferred);
        return value != null ? value : trimToNull(fallback);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
