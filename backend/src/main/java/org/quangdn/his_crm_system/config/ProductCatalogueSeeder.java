package org.quangdn.his_crm_system.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quangdn.his_crm_system.entity.Product;
import org.quangdn.his_crm_system.enums.PriceUnit;
import org.quangdn.his_crm_system.repository.ProductRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Loads the customer's product catalogue (from the BA hand-off) on first start so UAT has real data.
 * Runs only when the products table is empty; disable with {@code app.seed.enabled=false}.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class ProductCatalogueSeeder implements ApplicationRunner {

    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (productRepository.count() > 0) {
            return;
        }
        List<Product> products = List.of(
                product("LNS217", "Cooling Herbal Tea (Nước mát Sài Gòn)", "Color Man", "320ml x 24", 24, "24.00", 120, 40),
                product("LNS233", "Hillway Okinawa Milk Tea Fresh Pearl Cup", "Hillway", "70g x 48", 48, "81.12", 35, 40),
                product("LNS_F2003", "Ginger & Cordyceps Tea", "Hoang Linh Biotech", "20 sticks x 35", 35, "109.15", 18, 20),
                product("LNS_F2014", "Jujube & Ginseng Extract Stick Geaumsang Korea (5 mini box)", "Jayon Tree", "30 sticks x 10", 10, "252.90", 12, 10),
                product("LNS_F2015", "Jujube & Ginseng Extract Stick Geaumsang Korea (2 mini box)", "Jayon Tree", "12 sticks x 10", 10, "116.90", 0, 10),
                product("LNS269", "Collagen Jujube Jelly Stick Korea (15 sticks)", "Jayon Tree", "15 sticks x 30", 30, "204.70", 25, 15),
                product("LNS259", "Meizan Macaroni Long Tube", "Meizan", "400g x 12", 12, "35.88", 210, 50),
                product("LNS260", "Meizan Rice Vermicelli", "Meizan", "300g x 24", 24, "52.56", 8, 40),
                product("LNS264", "Meizan Thin Round Egg Noodle", "Meizan", "500g x 12", 12, "35.88", 95, 40),
                product("LNS274", "Meizan Tempura Crispy Frying Mix 1kg", "Meizan", "1kg x 10", 10, "36.90", 60, 30),
                product("LNS246", "Sriracha Chilli Sauce 830g (29.27 oz)", "Nam Duong", "830g x 12", 12, "47.88", 140, 45),
                product("LNS247", "Sriracha Chilli Sauce 480g (16.93 oz)", "Nam Duong", "480g x 12", 12, "29.88", 0, 45)
        );
        productRepository.saveAll(products);
        log.info("Seeded {} catalogue products", products.size());
    }

    private static Product product(String sku, String name, String brand, String packSize, int unitsPerCarton,
                                   String price, int stockQty, int minStock) {
        Product p = new Product();
        p.setSku(sku);
        p.setName(name);
        p.setBrand(brand);
        p.setPackSize(packSize);
        p.setPackDescription(packSize.toUpperCase() + " / carton");
        p.setUnitsPerCarton(unitsPerCarton);
        p.setPrice(new BigDecimal(price));
        p.setPriceUnit(PriceUnit.CARTON);
        p.setStockQty(stockQty);
        p.setMinStock(minStock);
        p.setActive(true);
        return p;
    }
}
