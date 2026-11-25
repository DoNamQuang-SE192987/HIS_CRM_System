package org.quangdn.his_crm_system.repository;

import org.quangdn.his_crm_system.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    List<Customer> findAllByOrderByNameAsc();

    List<Customer> findByNameContainingIgnoreCaseOrPhoneContainingOrderByNameAsc(String name, String phone);
}
