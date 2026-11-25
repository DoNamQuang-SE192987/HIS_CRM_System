package org.quangdn.his_crm_system.service;

import org.quangdn.his_crm_system.dto.request.ProductCreateRequest;
import org.quangdn.his_crm_system.dto.request.ProductFilter;
import org.quangdn.his_crm_system.dto.request.ProductUpdateRequest;
import org.quangdn.his_crm_system.dto.respone.PageResponse;
import org.quangdn.his_crm_system.dto.respone.ProductResponse;
import org.quangdn.his_crm_system.entity.Product;

/** Product catalogue use cases. */
public interface ProductService {

    int DEFAULT_PAGE_SIZE = 20;
    int MAX_PAGE_SIZE = 100;

    /** @param page 1-based; out-of-range page / size values are clamped rather than rejected. */
    PageResponse<ProductResponse> search(ProductFilter filter, int page, int size);

    ProductResponse get(Long id);

    ProductResponse create(ProductCreateRequest request);

    /** Updates editable fields only - never touches stockQty. */
    ProductResponse update(Long id, ProductUpdateRequest request);

    /** Discontinue an active product, or bring a discontinued one back. */
    ProductResponse toggleActive(Long id);

    /**
     * Entry point for the order module: returns the product only if it can be put on a new order.
     *
     * @throws org.quangdn.his_crm_system.exception.BusinessRuleException if the product is discontinued
     */
    Product getSellableProduct(Long id);
}
