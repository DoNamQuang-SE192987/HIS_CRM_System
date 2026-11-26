package org.quangdn.his_crm_system.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quangdn.his_crm_system.entity.Product;
import org.quangdn.his_crm_system.enums.PriceUnit;
import org.quangdn.his_crm_system.repository.ProductRepository;
import org.quangdn.his_crm_system.service.InventoryService;
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
    private final InventoryService inventoryService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (productRepository.count() > 0) {
            return;
        }
        // Demo catalogue: 10 items covering IN_STOCK / LOW / OUT. Images are served by the frontend
        // (frontend/public/images/products, credits in CREDITS.md there), so the path is relative to the web app.
        List<Seed> seeds = List.of(
                product("LNS217", "Cooling Herbal Tea (Nước mát Sài Gòn)", "Color Man", "320ml x 24", 24, "24.00", 120, 40, "herbal-tea.jpg"),
                product("LNS233", "Hillway Okinawa Milk Tea Fresh Pearl Cup", "Hillway", "70g x 48", 48, "81.12", 35, 40, "bubble-tea.jpg"),
                product("LNS_F2003", "Ginger & Cordyceps Tea", "Hoang Linh Biotech", "20 sticks x 35", 35, "109.15", 18, 20, "ginger-tea.jpg"),
                product("LNS_F2014", "Jujube & Ginseng Extract Stick Geaumsang Korea (5 mini box)", "Jayon Tree", "30 sticks x 10", 10, "252.90", 12, 10, "ginseng.jpg"),
                product("LNS269", "Collagen Jujube Jelly Stick Korea (15 sticks)", "Jayon Tree", "15 sticks x 30", 30, "204.70", 25, 15, "jujube.jpg"),
                product("LNS259", "Meizan Macaroni Long Tube", "Meizan", "400g x 12", 12, "35.88", 210, 50, "macaroni.jpg"),
                product("LNS260", "Meizan Rice Vermicelli", "Meizan", "300g x 24", 24, "52.56", 8, 40, "rice-vermicelli.jpg"),
                product("LNS264", "Meizan Thin Round Egg Noodle", "Meizan", "500g x 12", 12, "35.88", 95, 40, "egg-noodle.jpg"),
                product("LNS274", "Meizan Tempura Crispy Frying Mix 1kg", "Meizan", "1kg x 10", 10, "36.90", 0, 30, "tempura.jpg"),
                product("LNS246", "Sriracha Chilli Sauce 830g (29.27 oz)", "Nam Duong", "830g x 12", 12, "47.88", 140, 45, "sriracha.jpg")
        );
        // stock is never set directly: save with 0, then book the opening balance in the ledger
        seeds.forEach(seed -> productRepository.save(seed.product()));
        productRepository.flush();
        seeds.forEach(seed -> inventoryService.recordOpeningBalance(seed.product(), seed.openingStock()));
        log.info("Seeded {} catalogue products", seeds.size());
    }

    private record Seed(Product product, int openingStock) {
    }

    private static Seed product(String sku, String name, String brand, String packSize, int unitsPerCarton,
                                String price, int stockQty, int minStock, String image) {
        Product p = new Product();
        p.setSku(sku);
        p.setName(name);
        p.setBrand(brand);
        p.setPackSize(packSize);
        p.setPackDescription(packSize.toUpperCase() + " / carton");
        p.setUnitsPerCarton(unitsPerCarton);
        p.setPrice(new BigDecimal(price));
        p.setPriceUnit(PriceUnit.CARTON);
        p.setStockQty(0);
        p.setMinStock(minStock);
        p.setImageUrl("/images/products/" + image);
        p.setActive(true);
        return new Seed(p, stockQty);
    }
}
