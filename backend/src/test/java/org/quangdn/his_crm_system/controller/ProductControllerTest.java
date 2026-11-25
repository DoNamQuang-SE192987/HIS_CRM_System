package org.quangdn.his_crm_system.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.quangdn.his_crm_system.entity.Product;
import org.quangdn.his_crm_system.repository.ProductRepository;
import org.quangdn.his_crm_system.repository.SalesOrderRepository;
import org.quangdn.his_crm_system.repository.StockTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerTest {

    private static final String ROLE = "X-User-Role";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ProductRepository repository;

    @Autowired
    private SalesOrderRepository orderRepository;

    @Autowired
    private StockTransactionRepository stockTransactionRepository;

    @BeforeEach
    void setUp() {
        stockTransactionRepository.deleteAll();
        orderRepository.deleteAll();
        repository.deleteAll();
    }

    // ---------- GET /products ----------

    @Test
    void list_filtersByQueryBrandAndStockStatus() throws Exception {
        save("LNS001", "Meizan Macaroni", "Meizan", 100, 20);   // IN_STOCK
        save("LNS002", "Meizan Vermicelli", "Meizan", 5, 20);   // LOW
        save("LNS003", "Sriracha 830g", "Nam Duong", 0, 20);    // OUT
        save("LNS004", "Sriracha 480g", "Nam Duong", 50, 10);   // IN_STOCK

        mvc.perform(get("/products").header(ROLE, "SALES"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(4))
                .andExpect(jsonPath("$.page").value(1));

        mvc.perform(get("/products").param("q", "sriracha").header(ROLE, "WAREHOUSE"))
                .andExpect(jsonPath("$.items[*].sku", contains("LNS003", "LNS004")));

        mvc.perform(get("/products").param("q", "lns00").param("brand", "meizan").header(ROLE, "SALES"))
                .andExpect(jsonPath("$.items[*].sku", contains("LNS001", "LNS002")));

        mvc.perform(get("/products").param("stockStatus", "LOW").header(ROLE, "SALES"))
                .andExpect(jsonPath("$.items[*].sku", contains("LNS002")))
                .andExpect(jsonPath("$.items[0].stockStatus").value("LOW"));

        mvc.perform(get("/products").param("stockStatus", "OUT").header(ROLE, "SALES"))
                .andExpect(jsonPath("$.items[*].sku", contains("LNS003")));

        mvc.perform(get("/products").param("stockStatus", "IN_STOCK").header(ROLE, "SALES"))
                .andExpect(jsonPath("$.items[*].sku", contains("LNS001", "LNS004")));
    }

    @Test
    void list_paginates() throws Exception {
        for (int i = 1; i <= 5; i++) {
            save("SKU" + i, "Product " + i, "Brand", 10, 1);
        }
        mvc.perform(get("/products").param("page", "2").param("size", "2").header(ROLE, "SALES"))
                .andExpect(jsonPath("$.items[*].sku", contains("SKU3", "SKU4")))
                .andExpect(jsonPath("$.totalPages").value(3))
                .andExpect(jsonPath("$.size").value(2));
    }

    @Test
    void list_rejectsUnknownStockStatus() throws Exception {
        mvc.perform(get("/products").param("stockStatus", "MAYBE").header(ROLE, "SALES"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void list_requiresRoleHeader() throws Exception {
        mvc.perform(get("/products")).andExpect(status().isUnauthorized());
        mvc.perform(get("/products").header(ROLE, "HACKER")).andExpect(status().isUnauthorized());
    }

    // ---------- GET /products/{id} ----------

    @Test
    void get_returnsProductOr404() throws Exception {
        Product p = save("LNS217", "Cooling Herbal Tea", "Color Man", 30, 10);
        mvc.perform(get("/products/{id}", p.getId()).header(ROLE, "WAREHOUSE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("LNS217"))
                .andExpect(jsonPath("$.stockQty").value(30));

        mvc.perform(get("/products/{id}", 999_999).header(ROLE, "WAREHOUSE"))
                .andExpect(status().isNotFound());
    }

    // ---------- POST /products ----------

    @Test
    void create_succeedsForManagerAndNormalizesSku() throws Exception {
        create("""
                {"sku":" lns900 ","name":"New Noodle","brand":"Meizan","unitsPerCarton":12,"price":35.88,"minStock":10}
                """)
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", containsString("/products/")))
                .andExpect(jsonPath("$.sku").value("LNS900"))
                .andExpect(jsonPath("$.stockQty").value(0))
                .andExpect(jsonPath("$.stockStatus").value("OUT"))
                .andExpect(jsonPath("$.priceUnit").value("CARTON"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    void create_rejectsDuplicateSku() throws Exception {
        save("LNS900", "Existing", "Meizan", 1, 1);
        create("""
                {"sku":"lns900","name":"Dup","unitsPerCarton":1,"price":1}
                """)
                .andExpect(status().isConflict());
    }

    @Test
    void create_validatesPriceAndUnitsPerCarton() throws Exception {
        create("""
                {"sku":"X1","name":"Bad","unitsPerCarton":0,"price":0}
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.price").exists())
                .andExpect(jsonPath("$.fieldErrors.unitsPerCarton").exists());

        create("""
                {"sku":"X2","name":"Bad","unitsPerCarton":1,"price":-5}
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.price").exists());
    }

    @Test
    void create_isForbiddenForNonManagers() throws Exception {
        String body = """
                {"sku":"X1","name":"Ok","unitsPerCarton":1,"price":1}
                """;
        mvc.perform(post("/products").header(ROLE, "SALES").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());
        mvc.perform(post("/products").header(ROLE, "WAREHOUSE").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());
    }

    // ---------- PUT /products/{id} ----------

    @Test
    void update_changesFieldsButNeverStock() throws Exception {
        Product p = save("LNS100", "Old name", "Old", 42, 10);
        update(p.getId(), """
                {"sku":"LNS100","name":"New name","brand":"New","unitsPerCarton":24,"price":19.99,"minStock":50}
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New name"))
                .andExpect(jsonPath("$.price").value(19.99))
                .andExpect(jsonPath("$.stockQty").value(42))
                .andExpect(jsonPath("$.stockStatus").value("LOW"));
    }

    @Test
    void update_rejectsStockQty() throws Exception {
        Product p = save("LNS100", "Name", "Brand", 42, 10);
        update(p.getId(), """
                {"sku":"LNS100","name":"Name","unitsPerCarton":1,"price":1,"stockQty":999}
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.stockQty").exists());
        org.assertj.core.api.Assertions.assertThat(repository.findById(p.getId()).orElseThrow().getStockQty())
                .isEqualTo(42);
    }

    @Test
    void update_rejectsSkuTakenByAnotherProduct() throws Exception {
        save("LNS001", "A", "B", 1, 1);
        Product p = save("LNS002", "C", "D", 1, 1);
        update(p.getId(), """
                {"sku":"lns001","name":"C","unitsPerCarton":1,"price":1}
                """)
                .andExpect(status().isConflict());
    }

    @Test
    void update_returns404ForUnknownProduct() throws Exception {
        update(999_999L, """
                {"sku":"X","name":"C","unitsPerCarton":1,"price":1}
                """)
                .andExpect(status().isNotFound());
    }

    // ---------- PATCH /products/{id}/toggle ----------

    @Test
    void toggle_flipsActiveAndFiltersApply() throws Exception {
        Product p = save("LNS100", "Name", "Brand", 1, 1);

        mvc.perform(patch("/products/{id}/toggle", p.getId()).header(ROLE, "MANAGER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));

        mvc.perform(get("/products").param("active", "true").header(ROLE, "SALES"))
                .andExpect(jsonPath("$.totalItems").value(0));

        mvc.perform(patch("/products/{id}/toggle", p.getId()).header(ROLE, "MANAGER"))
                .andExpect(jsonPath("$.active").value(true));

        mvc.perform(patch("/products/{id}/toggle", p.getId()).header(ROLE, "SALES"))
                .andExpect(status().isForbidden());
    }

    // ---------- helpers ----------

    private ResultActions create(String json) throws Exception {
        return mvc.perform(post("/products").header(ROLE, "MANAGER")
                .contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private ResultActions update(Long id, String json) throws Exception {
        return mvc.perform(put("/products/{id}", id).header(ROLE, "MANAGER")
                .contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private Product save(String sku, String name, String brand, int stockQty, int minStock) {
        Product p = new Product();
        p.setSku(sku);
        p.setName(name);
        p.setBrand(brand);
        p.setUnitsPerCarton(12);
        p.setPrice(new BigDecimal("10.00"));
        p.setStockQty(stockQty);
        p.setMinStock(minStock);
        return repository.saveAndFlush(p);
    }
}
