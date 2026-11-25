package org.quangdn.his_crm_system.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quangdn.his_crm_system.entity.Supplier;
import org.quangdn.his_crm_system.repository.SupplierRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Suppliers of the catalogue brands, for the PO form. Runs only when the suppliers table is empty. */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class SupplierSeeder implements ApplicationRunner {

    private final SupplierRepository supplierRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (supplierRepository.count() > 0) {
            return;
        }
        List<Supplier> suppliers = List.of(
                supplier("Meizan Distribution USA", "Linh Tran", "(626) 555-0110", "orders@meizan-usa.example",
                        "2100 W Valley Blvd, Alhambra, CA 91803", 14),
                supplier("Nam Duong Foods Import", "Minh Pham", "(714) 555-0122", "sales@namduong-import.example",
                        "9200 Bolsa Ave, Westminster, CA 92683", 10),
                supplier("Jayon Tree Korea Trading", "Ji-ho Park", "(213) 555-0135", "export@jayontree.example",
                        "3250 Wilshire Blvd, Los Angeles, CA 90010", 30),
                supplier("Saigon Beverage Co.", "Hoa Nguyen", "(408) 555-0147", "b2b@saigonbev.example",
                        "1550 Story Rd, San Jose, CA 95122", 21)
        );
        supplierRepository.saveAll(suppliers);
        log.info("Seeded {} suppliers", suppliers.size());
    }

    private static Supplier supplier(String name, String contactName, String phone, String email, String address,
                                     int leadTimeDays) {
        Supplier s = new Supplier();
        s.setName(name);
        s.setContactName(contactName);
        s.setPhone(phone);
        s.setEmail(email);
        s.setAddress(address);
        s.setLeadTimeDays(leadTimeDays);
        return s;
    }
}
