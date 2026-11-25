package org.quangdn.his_crm_system.service.impl;

import lombok.RequiredArgsConstructor;
import org.quangdn.his_crm_system.dto.request.OrderCreateRequest;
import org.quangdn.his_crm_system.dto.request.OrderFilter;
import org.quangdn.his_crm_system.dto.request.OrderItemRequest;
import org.quangdn.his_crm_system.dto.respone.OrderDetailResponse;
import org.quangdn.his_crm_system.dto.respone.OrderSummaryResponse;
import org.quangdn.his_crm_system.dto.respone.PageResponse;
import org.quangdn.his_crm_system.entity.Customer;
import org.quangdn.his_crm_system.entity.OrderItem;
import org.quangdn.his_crm_system.entity.Product;
import org.quangdn.his_crm_system.entity.SalesOrder;
import org.quangdn.his_crm_system.enums.OrderStatus;
import org.quangdn.his_crm_system.exception.DuplicateResourceException;
import org.quangdn.his_crm_system.exception.InvalidStatusException;
import org.quangdn.his_crm_system.exception.RequestValidationException;
import org.quangdn.his_crm_system.exception.ResourceNotFoundException;
import org.quangdn.his_crm_system.repository.InvoiceRepository;
import org.quangdn.his_crm_system.repository.SalesOrderRepository;
import org.quangdn.his_crm_system.repository.SalesOrderSpecifications;
import org.quangdn.his_crm_system.service.CustomerService;
import org.quangdn.his_crm_system.service.InventoryService;
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
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private final SalesOrderRepository orderRepository;
    private final InvoiceRepository invoiceRepository;
    private final InventoryService inventoryService;
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
        return toDetail(findDetailOrThrow(id));
    }

    @Transactional
    @Override
    public OrderDetailResponse create(OrderCreateRequest request) {
        String externalOrderNo = validateExternalOrderNo(request);
        validateNoDuplicateProducts(request.items());

        Customer customer = resolveCustomer(request);
        boolean marketplace = request.channel().isMarketplace();

        // Marketplace: the buyer is a one-off person, so recipient + address must come with the order.
        // Wholesale: default to the customer's own name / address.
        String recipientName = marketplace
                ? trimToNull(request.recipientName())
                : firstNonBlank(request.recipientName(), customer.getName());
        if (recipientName == null) {
            throw new RequestValidationException("recipientName", "is required for " + request.channel() + " orders");
        }
        String shipTo = marketplace ? trimToNull(request.shipTo()) : firstNonBlank(request.shipTo(), customer.getAddress());
        if (shipTo == null) {
            throw new RequestValidationException("shipTo", marketplace
                    ? "is required for " + request.channel() + " orders"
                    : "is required (customer has no default address)");
        }
        String billTo = marketplace ? trimToNull(request.billTo()) : firstNonBlank(request.billTo(), customer.getAddress());

        SalesOrder order = new SalesOrder();
        order.setChannel(request.channel());
        order.setExternalOrderNo(externalOrderNo);
        order.setCustomer(customer);
        order.setRecipientName(recipientName);
        order.setShipTo(shipTo);
        order.setBillTo(billTo);
        order.setOrderDate(request.orderDate() != null ? request.orderDate() : today());
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

        return toDetail(order);
    }

    @Transactional
    @Override
    public OrderDetailResponse ship(Long id) {
        SalesOrder order = orderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        requireNew(order, "ship", "shipped");

        // locks products, checks every line, deducts + writes OUT; throws (and rolls back everything) if short
        inventoryService.shipSalesOrder(order);

        order.setStatus(OrderStatus.SHIPPED);
        order.setShippedAt(Instant.now(clock));
        orderRepository.flush();

        return toDetail(order);
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

        return toDetail(order);
    }

    // ---------------------------------------------------------------- helpers

    private OrderDetailResponse toDetail(SalesOrder order) {
        return OrderDetailResponse.from(order, invoiceRepository.findByOrderId(order.getId()).orElse(null), today());
    }

    private SalesOrder findDetailOrThrow(Long id) {
        return orderRepository.findDetailById(id).orElseThrow(() -> new ResourceNotFoundException("Order", id));
    }

    private static void requireNew(SalesOrder order, String action, String pastTense) {
        if (order.getStatus() != OrderStatus.NEW) {
            throw new InvalidStatusException("Cannot %s order %s: status is %s, only NEW orders can be %s"
                    .formatted(action, order.getCode(), order.getStatus(), pastTense));
        }
    }

    /**
     * WHOLESALE orders need a wholesale customer. Marketplace orders are billed to that marketplace's account:
     * omitted customerId = the account is used automatically; any other customer is rejected.
     */
    private Customer resolveCustomer(OrderCreateRequest request) {
        if (request.channel().isMarketplace()) {
            Customer account = customerService.getMarketplaceAccount(request.channel());
            if (request.customerId() != null && !request.customerId().equals(account.getId())) {
                throw new RequestValidationException("customerId", "%s orders are billed to '%s' (id %d); omit customerId"
                        .formatted(request.channel(), account.getName(), account.getId()));
            }
            return account;
        }
        if (request.customerId() == null) {
            throw new RequestValidationException("customerId", "is required for WHOLESALE orders");
        }
        Customer customer = customerService.getEntity(request.customerId());
        if (customer.isMarketplaceAccount()) {
            throw new RequestValidationException("customerId",
                    "'" + customer.getName() + "' is a marketplace account and cannot be used for WHOLESALE orders");
        }
        return customer;
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
