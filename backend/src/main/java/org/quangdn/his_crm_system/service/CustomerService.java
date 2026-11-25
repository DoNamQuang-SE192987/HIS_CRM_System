package org.quangdn.his_crm_system.service;

import org.quangdn.his_crm_system.dto.request.CustomerCreateRequest;
import org.quangdn.his_crm_system.dto.respone.CustomerResponse;
import org.quangdn.his_crm_system.entity.Customer;

import java.util.List;

public interface CustomerService {

    /** All customers sorted by name, optionally filtered by name / phone (for the order form dropdown). */
    List<CustomerResponse> list(String q);

    CustomerResponse create(CustomerCreateRequest request);

    /** @throws org.quangdn.his_crm_system.exception.ResourceNotFoundException if missing */
    Customer getEntity(Long id);
}
