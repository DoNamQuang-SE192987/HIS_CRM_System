package org.quangdn.his_crm_system.service;

import org.quangdn.his_crm_system.dto.respone.SupplierResponse;
import org.quangdn.his_crm_system.entity.Supplier;

import java.util.List;

public interface SupplierService {

    /** All suppliers sorted by name (PO form dropdown). */
    List<SupplierResponse> list();

    /** @throws org.quangdn.his_crm_system.exception.ResourceNotFoundException if missing */
    Supplier getEntity(Long id);
}
