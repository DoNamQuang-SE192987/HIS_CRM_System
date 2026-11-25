package org.quangdn.his_crm_system.config;

import lombok.RequiredArgsConstructor;
import org.quangdn.his_crm_system.enums.SalesChannel;
import org.quangdn.his_crm_system.service.CustomerService;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Makes sure every marketplace has its shared customer account ("Walmart Marketplace", "Amazon Marketplace")
 * so it shows up in the customer list from day one. System data - runs regardless of {@code app.seed.enabled}.
 */
@Component
@RequiredArgsConstructor
public class MarketplaceAccountInitializer implements ApplicationRunner {

    private final CustomerService customerService;

    @Override
    public void run(ApplicationArguments args) {
        Arrays.stream(SalesChannel.values())
                .filter(SalesChannel::isMarketplace)
                .forEach(customerService::getMarketplaceAccount);
    }
}
