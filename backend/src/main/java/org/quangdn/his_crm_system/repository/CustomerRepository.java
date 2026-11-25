package org.quangdn.his_crm_system.repository;

import org.quangdn.his_crm_system.entity.Customer;
import org.quangdn.his_crm_system.enums.SalesChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {

    Optional<Customer> findByMarketplaceChannel(SalesChannel channel);
}
