package org.quangdn.his_crm_system.service.impl;

import lombok.RequiredArgsConstructor;
import org.quangdn.his_crm_system.dto.respone.SupplierResponse;
import org.quangdn.his_crm_system.entity.Supplier;
import org.quangdn.his_crm_system.exception.ResourceNotFoundException;
import org.quangdn.his_crm_system.repository.SupplierRepository;
import org.quangdn.his_crm_system.service.SupplierService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;

    @Override
    public List<SupplierResponse> list() {
        return supplierRepository.findAllByOrderByNameAsc().stream().map(SupplierResponse::from).toList();
    }

    @Override
    public Supplier getEntity(Long id) {
        return supplierRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Supplier", id));
    }
}
