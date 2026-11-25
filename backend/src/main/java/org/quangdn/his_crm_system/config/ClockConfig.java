package org.quangdn.his_crm_system.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

/** Single source of "today" (order date, overdue check) - replaceable in tests. */
@Configuration
public class ClockConfig {

    @Bean
    public Clock clock(@Value("${app.timezone:}") String zone) {
        return zone.isBlank() ? Clock.systemDefaultZone() : Clock.system(ZoneId.of(zone));
    }
}
