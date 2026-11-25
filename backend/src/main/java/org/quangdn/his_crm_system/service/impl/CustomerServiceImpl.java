package org.quangdn.his_crm_system.service.impl;

import lombok.RequiredArgsConstructor;
import org.quangdn.his_crm_system.dto.request.CustomerCreateRequest;
import org.quangdn.his_crm_system.dto.respone.CustomerResponse;
import org.quangdn.his_crm_system.entity.Customer;
import org.quangdn.his_crm_system.enums.SalesChannel;
import org.quangdn.his_crm_system.exception.ResourceNotFoundException;
import org.quangdn.his_crm_system.repository.CustomerRepository;
import org.quangdn.his_crm_system.repository.CustomerSpecifications;
import org.quangdn.his_crm_system.service.CustomerService;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    public List<CustomerResponse> list(String q, SalesChannel channel) {
        return customerRepository.findAll(CustomerSpecifications.filter(q, channel), Sort.by("name")).stream()
                .map(CustomerResponse::from)
                .toList();
    }

    @Transactional
    @Override
    public CustomerResponse create(CustomerCreateRequest request) {
        Customer customer = new Customer();
        customer.setName(request.name().trim());
        customer.setPhone(trimToNull(request.phone()));
        customer.setEmail(trimToNull(request.email()));
        customer.setAddress(trimToNull(request.address()));
        customer.setPaymentTermDays(request.paymentTermDays() == null ? 0 : request.paymentTermDays());
        return CustomerResponse.from(customerRepository.saveAndFlush(customer));
    }

    @Override
    public Customer getEntity(Long id) {
        return customerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer", id));
    }

    /** Get-or-create; the unique constraint on marketplace_channel guarantees one account per marketplace. */
    @Transactional
    @Override
    public Customer getMarketplaceAccount(SalesChannel channel) {
        if (!channel.isMarketplace()) {
            throw new IllegalArgumentException(channel + " is not a marketplace");
        }
        return customerRepository.findByMarketplaceChannel(channel).orElseGet(() -> {
            Customer account = new Customer();
            String name = channel.name().charAt(0) + channel.name().substring(1).toLowerCase(Locale.ROOT);
            account.setName(name + " Marketplace");
            account.setMarketplaceChannel(channel);
            account.setPaymentTermDays(0);
            return customerRepository.saveAndFlush(account);
        });
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
