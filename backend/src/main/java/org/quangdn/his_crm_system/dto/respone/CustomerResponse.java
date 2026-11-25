package org.quangdn.his_crm_system.dto.respone;

import org.quangdn.his_crm_system.entity.Customer;
import org.quangdn.his_crm_system.enums.SalesChannel;

/** @param marketplaceChannel WALMART / AMAZON for the system marketplace accounts, null for wholesale customers */
public record CustomerResponse(
        Long id,
        String name,
        String phone,
        String email,
        String address,
        Integer paymentTermDays,
        SalesChannel marketplaceChannel
) {

    public static CustomerResponse from(Customer c) {
        return new CustomerResponse(c.getId(), c.getName(), c.getPhone(), c.getEmail(), c.getAddress(),
                c.getPaymentTermDays(), c.getMarketplaceChannel());
    }
}
