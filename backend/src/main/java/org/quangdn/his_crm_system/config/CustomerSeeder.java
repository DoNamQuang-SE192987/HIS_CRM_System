package org.quangdn.his_crm_system.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quangdn.his_crm_system.entity.Customer;
import org.quangdn.his_crm_system.repository.CustomerRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Sample wholesale + marketplace customers for UAT. Runs only when the customers table is empty. */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class CustomerSeeder implements ApplicationRunner {

    private final CustomerRepository customerRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (customerRepository.count() > 0) {
            return;
        }
        List<Customer> customers = List.of(
                customer("Pacific Harvest Foods", "(510) 555-0142", "1420 Harbor Blvd, Oakland, CA 94607", 30),
                customer("Golden Gate Asian Market", "(415) 555-0187", "2250 Irving St, San Francisco, CA 94122", 15),
                customer("Sunrise Supermarket Chain", "(408) 555-0133", "1600 Story Rd, San Jose, CA 95122", 30),
                customer("Elizabeth Lopez", null, "12002 Fairpoint Dr, Houston, TX 77099", 0),
                customer("Priscilla Luu", null, "8800 Bellaire Blvd, Houston, TX 77036", 0)
        );
        customerRepository.saveAll(customers);
        log.info("Seeded {} customers", customers.size());
    }

    private static Customer customer(String name, String phone, String address, int paymentTermDays) {
        Customer c = new Customer();
        c.setName(name);
        c.setPhone(phone);
        c.setAddress(address);
        c.setPaymentTermDays(paymentTermDays);
        return c;
    }
}
