package org.quangdn.his_crm_system.service.impl;

import lombok.RequiredArgsConstructor;
import org.quangdn.his_crm_system.dto.request.ProductCreateRequest;
import org.quangdn.his_crm_system.dto.request.ProductFilter;
import org.quangdn.his_crm_system.dto.request.ProductUpdateRequest;
import org.quangdn.his_crm_system.dto.respone.PageResponse;
import org.quangdn.his_crm_system.dto.respone.ProductResponse;
import org.quangdn.his_crm_system.entity.Product;
import org.quangdn.his_crm_system.enums.PriceUnit;
import org.quangdn.his_crm_system.exception.BusinessRuleException;
import org.quangdn.his_crm_system.exception.DuplicateResourceException;
import org.quangdn.his_crm_system.exception.ResourceNotFoundException;
import org.quangdn.his_crm_system.repository.ProductRepository;
import org.quangdn.his_crm_system.repository.ProductSpecifications;
import org.quangdn.his_crm_system.service.InventoryService;
import org.quangdn.his_crm_system.service.ProductService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final InventoryService inventoryService;

    @Override
    public PageResponse<ProductResponse> search(ProductFilter filter, int page, int size) {
        int safePage = Math.max(page, 1) - 1;
        int safeSize = Math.clamp(size, 1, MAX_PAGE_SIZE);
        PageRequest pageable = PageRequest.of(safePage, safeSize, Sort.by("sku"));
        return PageResponse.from(
                productRepository.findAll(ProductSpecifications.filter(filter), pageable),
                ProductResponse::from);
    }

    @Override
    public ProductResponse get(Long id) {
        return ProductResponse.from(findOrThrow(id));
    }

    @Transactional
    @Override
    public ProductResponse create(ProductCreateRequest request) {
        String sku = normalizeSku(request.sku());
        if (productRepository.existsBySku(sku)) {
            throw new DuplicateResourceException("SKU already exists: " + sku);
        }

        Product product = new Product();
        product.setSku(sku);
        applyEditableFields(product, request.name(), request.brand(), request.packSize(), request.packDescription(),
                request.unitsPerCarton(), request.price(), request.priceUnit(), request.minStock(), request.imageUrl());
        product.setStockQty(0);
        product.setActive(true);
        productRepository.saveAndFlush(product);

        // opening stock goes through the ledger like every other stock change
        if (request.stockQty() != null) {
            inventoryService.recordOpeningBalance(product, request.stockQty());
        }
        return ProductResponse.from(product);
    }

    @Transactional
    @Override
    public ProductResponse update(Long id, ProductUpdateRequest request) {
        Product product = findOrThrow(id);

        String sku = normalizeSku(request.sku());
        if (!sku.equals(product.getSku()) && productRepository.existsBySkuAndIdNot(sku, id)) {
            throw new DuplicateResourceException("SKU already exists: " + sku);
        }

        product.setSku(sku);
        applyEditableFields(product, request.name(), request.brand(), request.packSize(), request.packDescription(),
                request.unitsPerCarton(), request.price(), request.priceUnit(), request.minStock(), request.imageUrl());
        // stockQty is intentionally untouched.

        return ProductResponse.from(productRepository.saveAndFlush(product));
    }

    @Transactional
    @Override
    public ProductResponse toggleActive(Long id) {
        Product product = findOrThrow(id);
        product.setActive(!product.isActive());
        return ProductResponse.from(productRepository.saveAndFlush(product));
    }

    /**
     * Entry point for the order module: returns the product only if it can be put on a new order.
     *
     * @throws BusinessRuleException if the product is discontinued
     */
    @Override
    public Product getSellableProduct(Long id) {
        Product product = findOrThrow(id);
        if (!product.isActive()) {
            throw new BusinessRuleException("Product " + product.getSku() + " is discontinued and cannot be ordered");
        }
        return product;
    }

    private Product findOrThrow(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    private static void applyEditableFields(Product product, String name, String brand, String packSize,
                                            String packDescription, Integer unitsPerCarton, BigDecimal price,
                                            PriceUnit priceUnit, Integer minStock, String imageUrl) {
        product.setName(name.trim());
        product.setBrand(trimToNull(brand));
        product.setPackSize(trimToNull(packSize));
        product.setPackDescription(trimToNull(packDescription));
        product.setUnitsPerCarton(unitsPerCarton);
        product.setPrice(price);
        product.setPriceUnit(priceUnit == null ? PriceUnit.CARTON : priceUnit);
        product.setMinStock(minStock == null ? 0 : minStock);
        product.setImageUrl(trimToNull(imageUrl));
    }

    private static String normalizeSku(String sku) {
        return sku.trim().toUpperCase(Locale.ROOT);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
