package org.quangdn.his_crm_system.service.impl;

import lombok.RequiredArgsConstructor;
import org.quangdn.his_crm_system.dto.request.DamagedStockRequest;
import org.quangdn.his_crm_system.dto.request.InventoryTransactionFilter;
import org.quangdn.his_crm_system.dto.request.ProductFilter;
import org.quangdn.his_crm_system.dto.request.StockInRequest;
import org.quangdn.his_crm_system.dto.respone.InventoryItemResponse;
import org.quangdn.his_crm_system.dto.respone.InventoryTransactionResponse;
import org.quangdn.his_crm_system.dto.respone.PageResponse;
import org.quangdn.his_crm_system.dto.respone.StockShortageResponse;
import org.quangdn.his_crm_system.entity.InventoryTransaction;
import org.quangdn.his_crm_system.entity.OrderItem;
import org.quangdn.his_crm_system.entity.Product;
import org.quangdn.his_crm_system.entity.PurchaseOrder;
import org.quangdn.his_crm_system.entity.PurchaseOrderItem;
import org.quangdn.his_crm_system.entity.SalesOrder;
import org.quangdn.his_crm_system.enums.InventoryRefType;
import org.quangdn.his_crm_system.enums.InventoryTransactionType;
import org.quangdn.his_crm_system.enums.StockStatus;
import org.quangdn.his_crm_system.exception.InsufficientStockException;
import org.quangdn.his_crm_system.exception.RequestValidationException;
import org.quangdn.his_crm_system.exception.ResourceNotFoundException;
import org.quangdn.his_crm_system.repository.InventoryTransactionRepository;
import org.quangdn.his_crm_system.repository.InventoryTransactionSpecifications;
import org.quangdn.his_crm_system.repository.ProductRepository;
import org.quangdn.his_crm_system.repository.ProductSpecifications;
import org.quangdn.his_crm_system.repository.SalesOrderRepository;
import org.quangdn.his_crm_system.service.InventoryService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.function.ToIntFunction;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryServiceImpl implements InventoryService {

    private final ProductRepository productRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final SalesOrderRepository orderRepository;
    private final Clock clock;

    // ---------------------------------------------------------------- warehouse screens

    @Override
    public List<InventoryItemResponse> list(String q, StockStatus status) {
        Map<Long, Integer> committed = orderRepository.committedQtyByProduct();
        return productRepository.findAll(ProductSpecifications.filter(new ProductFilter(q, null, status, null)),
                        Sort.by("sku")).stream()
                .map(p -> InventoryItemResponse.from(p, committed.getOrDefault(p.getId(), 0)))
                .toList();
    }

    @Override
    public PageResponse<InventoryTransactionResponse> transactions(InventoryTransactionFilter filter, int page, int size) {
        if (filter.from() != null && filter.to() != null && filter.from().isAfter(filter.to())) {
            throw new RequestValidationException("to", "must be on or after 'from'");
        }
        ZoneId zone = clock.getZone();
        Instant from = filter.from() == null ? null : filter.from().atStartOfDay(zone).toInstant();
        Instant toExclusive = filter.to() == null ? null : filter.to().plusDays(1).atStartOfDay(zone).toInstant();

        PageRequest pageable = PageRequest.of(Math.max(page, 1) - 1, Math.clamp(size, 1, MAX_PAGE_SIZE),
                Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")));
        return PageResponse.from(
                transactionRepository.findAll(InventoryTransactionSpecifications.filter(
                        filter.productId(), filter.type(), from, toExclusive), pageable),
                InventoryTransactionResponse::from);
    }

    @Transactional
    @Override
    public InventoryTransactionResponse stockIn(StockInRequest request) {
        Product product = lockProduct(request.productId());
        InventoryTransaction tx = apply(product, InventoryTransactionType.IN, request.qty(),
                InventoryRefType.MANUAL, null, null, trimToNull(request.note()));
        return InventoryTransactionResponse.from(tx);
    }

    @Transactional
    @Override
    public InventoryTransactionResponse recordDamaged(DamagedStockRequest request) {
        Product product = lockProduct(request.productId());
        if (request.qty() > product.getStockQty()) {
            throw new InsufficientStockException(
                    "Không thể huỷ %d %s: tồn kho chỉ còn %d".formatted(request.qty(), product.getSku(), product.getStockQty()),
                    List.of(new StockShortageResponse(product.getSku(), request.qty(), product.getStockQty())));
        }
        InventoryTransaction tx = apply(product, InventoryTransactionType.DAMAGED, -request.qty(),
                InventoryRefType.MANUAL, null, null, request.reason().trim());
        return InventoryTransactionResponse.from(tx);
    }

    // ---------------------------------------------------------------- called by other services

    @Transactional
    @Override
    public void recordOpeningBalance(Product product, int qty) {
        if (qty > 0) {
            apply(product, InventoryTransactionType.IN, qty, InventoryRefType.OPENING_BALANCE, null, null,
                    "Opening balance");
        }
    }

    @Transactional
    @Override
    public void shipSalesOrder(SalesOrder order) {
        Map<Long, Integer> qtyByProduct = sumByProduct(order.getItems(), i -> i.getProduct().getId(), OrderItem::getQty);
        Map<Long, Product> locked = lockProducts(qtyByProduct);

        // check every line before touching anything, so the error lists all shortages at once
        List<StockShortageResponse> shortages = new ArrayList<>();
        qtyByProduct.forEach((productId, required) -> {
            Product product = locked.get(productId);
            if (product.getStockQty() < required) {
                shortages.add(new StockShortageResponse(product.getSku(), required, product.getStockQty()));
            }
        });
        if (!shortages.isEmpty()) {
            throw InsufficientStockException.forOrder(order.getCode(), shortages);
        }

        qtyByProduct.forEach((productId, qty) -> apply(locked.get(productId), InventoryTransactionType.OUT, -qty,
                InventoryRefType.SALES_ORDER, order.getId(), order.getCode(), "Shipped order " + order.getCode()));
    }

    @Transactional
    @Override
    public void receivePurchaseOrder(PurchaseOrder purchaseOrder) {
        Map<Long, Integer> qtyByProduct = sumByProduct(purchaseOrder.getItems(),
                i -> i.getProduct().getId(), PurchaseOrderItem::getQty);
        Map<Long, Product> locked = lockProducts(qtyByProduct);

        qtyByProduct.forEach((productId, qty) -> apply(locked.get(productId), InventoryTransactionType.IN, qty,
                InventoryRefType.PURCHASE_ORDER, purchaseOrder.getId(), purchaseOrder.getCode(),
                "Received " + purchaseOrder.getCode()));
    }

    // ---------------------------------------------------------------- the single write path

    /**
     * Changes stock and writes the matching ledger line - the only place where stockQty is modified.
     * Callers lock the product row first.
     */
    private InventoryTransaction apply(Product product, InventoryTransactionType type, int signedQty,
                                       InventoryRefType refType, Long refId, String refCode, String note) {
        int newQty = product.getStockQty() + signedQty;
        if (newQty < 0) {
            // callers validate first; this guard keeps the invariant even if a future caller forgets
            throw new InsufficientStockException("Stock of " + product.getSku() + " cannot go negative",
                    List.of(new StockShortageResponse(product.getSku(), -signedQty, product.getStockQty())));
        }
        product.setStockQty(newQty);

        InventoryTransaction tx = new InventoryTransaction();
        tx.setProduct(product);
        tx.setType(type);
        tx.setQuantity(signedQty);
        tx.setBalanceAfter(newQty);
        tx.setRefType(refType);
        tx.setRefId(refId);
        tx.setRefCode(refCode);
        tx.setNote(note);
        return transactionRepository.saveAndFlush(tx);
    }

    private Product lockProduct(Long productId) {
        return productRepository.findByIdForUpdate(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
    }

    /** Locks in id order (see ProductRepository#findAllByIdForUpdate) to avoid deadlocks. */
    private Map<Long, Product> lockProducts(Map<Long, Integer> qtyByProduct) {
        return productRepository.findAllByIdForUpdate(qtyByProduct.keySet()).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));
    }

    private static <T> Map<Long, Integer> sumByProduct(List<T> lines, Function<T, Long> productId, ToIntFunction<T> qty) {
        return lines.stream().collect(Collectors.toMap(productId, qty::applyAsInt, Integer::sum, LinkedHashMap::new));
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
