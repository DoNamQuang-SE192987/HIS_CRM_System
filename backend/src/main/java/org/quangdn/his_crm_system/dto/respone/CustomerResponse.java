package org.quangdn.his_crm_system.dto.respone;

import org.quangdn.his_crm_system.entity.Customer;

public record CustomerResponse(
        Long id,
        String name,
        String phone,
        String email,
        String address,
        Integer paymentTermDays
) {

    public static CustomerResponse from(Customer c) {
        return new CustomerResponse(c.getId(), c.getName(), c.getPhone(), c.getEmail(), c.getAddress(),
                c.getPaymentTermDays());
    }
}
