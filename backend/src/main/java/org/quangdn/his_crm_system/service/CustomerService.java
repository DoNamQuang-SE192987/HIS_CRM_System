package org.quangdn.his_crm_system.service;

import org.quangdn.his_crm_system.dto.request.CustomerCreateRequest;
import org.quangdn.his_crm_system.dto.respone.CustomerResponse;
import org.quangdn.his_crm_system.entity.Customer;
import org.quangdn.his_crm_system.enums.SalesChannel;

import java.util.List;

public interface CustomerService {

    /**
     * Customers sorted by name (order form dropdown).
     *
     * @param q       name / phone filter
     * @param channel WHOLESALE = wholesale customers only, WALMART / AMAZON = that marketplace account, null = all
     */
    List<CustomerResponse> list(String q, SalesChannel channel);

    /** Creates a wholesale customer. Marketplace accounts are system-managed. */
    CustomerResponse create(CustomerCreateRequest request);

    /** @throws org.quangdn.his_crm_system.exception.ResourceNotFoundException if missing */
    Customer getEntity(Long id);

    /** The shared account of a marketplace ("Walmart Marketplace"), created on first use. */
    Customer getMarketplaceAccount(SalesChannel channel);
}
