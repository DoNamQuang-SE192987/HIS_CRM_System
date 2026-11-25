package org.quangdn.his_crm_system.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Seller information printed on invoices ("From" block). Configure with {@code app.company.*}.
 */
@ConfigurationProperties(prefix = "app.company")
public record CompanyProperties(
        String name,
        String address,
        String phone,
        String email
) {
}
