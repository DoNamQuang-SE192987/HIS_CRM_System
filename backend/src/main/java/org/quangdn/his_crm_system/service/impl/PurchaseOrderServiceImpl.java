package org.quangdn.his_crm_system.service.impl;

import lombok.RequiredArgsConstructor;
import org.quangdn.his_crm_system.dto.request.PurchaseOrderCreateRequest;
import org.quangdn.his_crm_system.dto.request.PurchaseOrderItemRequest;
import org.quangdn.his_crm_system.dto.respone.PageResponse;
import org.quangdn.his_crm_system.dto.respone.PurchaseOrderDetailResponse;
import org.quangdn.his_crm_system.dto.respone.PurchaseOrderSummaryResponse;
import org.quangdn.his_crm_system.entity.Product;
import org.quangdn.his_crm_system.entity.PurchaseOrder;
import org.quangdn.his_crm_system.entity.PurchaseOrderItem;
import org.quangdn.his_crm_system.enums.PurchaseOrderStatus;
import org.quangdn.his_crm_system.exception.InvalidStatusException;
import org.quangdn.his_crm_system.exception.RequestValidationException;
import org.quangdn.his_crm_system.exception.ResourceNotFoundException;
import org.quangdn.his_crm_system.repository.PurchaseOrderRepository;
import org.quangdn.his_crm_system.service.InventoryService;
import org.quangdn.his_crm_system.service.ProductService;
import org.quangdn.his_crm_system.service.PurchaseOrderService;
import org.quangdn.his_crm_system.service.SupplierService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierService supplierService;
    private final ProductService productService;
    private final InventoryService inventoryService;
    private final Clock clock;

    @Override
    public PageResponse<PurchaseOrderSummaryResponse> search(PurchaseOrderStatus status, int page, int size) {
        PageRequest pageable = PageRequest.of(Math.max(page, 1) - 1, Math.clamp(size, 1, MAX_PAGE_SIZE),
                Sort.by(Sort.Direction.DESC, "id"));
        Page<PurchaseOrder> result = status == null
                ? purchaseOrderRepository.findAll(pageable)
                : purchaseOrderRepository.findByStatus(status, pageable);
        return PageResponse.from(result, PurchaseOrderSummaryResponse::from);
    }

    @Override
    public PurchaseOrderDetailResponse get(Long id) {
        return PurchaseOrderDetailResponse.from(findDetailOrThrow(id));
    }

    @Transactional
    @Override
    public PurchaseOrderDetailResponse create(PurchaseOrderCreateRequest request) {
        validateNoDuplicateProducts(request);

        PurchaseOrder po = new PurchaseOrder();
        po.setSupplier(supplierService.getEntity(request.supplierId()));
        po.setStatus(PurchaseOrderStatus.ORDERED);
        po.setOrderDate(LocalDate.now(clock));
        po.setExpectedDate(request.expectedDate());
        po.setNote(trimToNull(request.note()));

        for (PurchaseOrderItemRequest line : request.items()) {
            // 404 for unknown, 422 for discontinued products - no point restocking what we no longer sell
            Product product = productService.getSellableProduct(line.productId());
            PurchaseOrderItem item = new PurchaseOrderItem();
            item.setProduct(product);
            item.setSku(product.getSku());
            item.setProductName(product.getName());
            item.setQty(line.qty());
            po.addItem(item);
        }

        // INSERT first to obtain the id, then derive the human code from it (UPDATE in the same transaction)
        purchaseOrderRepository.saveAndFlush(po);
        po.setCode("PO-%d-%04d".formatted(po.getOrderDate().getYear(), po.getId()));
        purchaseOrderRepository.flush();

        return PurchaseOrderDetailResponse.from(po);
    }

    @Transactional
    @Override
    public PurchaseOrderDetailResponse receive(Long id) {
        PurchaseOrder po = purchaseOrderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order", id));
        if (po.getStatus() != PurchaseOrderStatus.ORDERED) {
            throw new InvalidStatusException("Cannot receive %s: status is %s, only ORDERED purchase orders can be received"
                    .formatted(po.getCode(), po.getStatus()));
        }

        inventoryService.receivePurchaseOrder(po);

        po.setStatus(PurchaseOrderStatus.RECEIVED);
        po.setReceivedAt(Instant.now(clock));
        purchaseOrderRepository.flush();

        return PurchaseOrderDetailResponse.from(po);
    }

    private PurchaseOrder findDetailOrThrow(Long id) {
        return purchaseOrderRepository.findDetailById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order", id));
    }

    private static void validateNoDuplicateProducts(PurchaseOrderCreateRequest request) {
        Set<Long> seen = new HashSet<>();
        for (PurchaseOrderItemRequest item : request.items()) {
            if (!seen.add(item.productId())) {
                throw new RequestValidationException("items",
                        "product " + item.productId() + " appears more than once; merge the quantities into one line");
            }
        }
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
