package org.quangdn.his_crm_system.dto.respone;

import org.quangdn.his_crm_system.entity.Supplier;

public record SupplierResponse(
        Long id,
        String name,
        String contactName,
        String phone,
        String email,
        String address,
        Integer leadTimeDays
) {

    public static SupplierResponse from(Supplier s) {
        return new SupplierResponse(s.getId(), s.getName(), s.getContactName(), s.getPhone(), s.getEmail(),
                s.getAddress(), s.getLeadTimeDays());
    }
}
