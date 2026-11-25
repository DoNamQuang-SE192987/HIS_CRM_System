package org.quangdn.his_crm_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class HisCrmSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(HisCrmSystemApplication.class, args);
    }

}
