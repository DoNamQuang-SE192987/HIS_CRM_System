package org.quangdn.his_crm_system.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.quangdn.his_crm_system.entity.Customer;
import org.quangdn.his_crm_system.repository.CustomerRepository;
import org.quangdn.his_crm_system.support.DatabaseCleaner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.time.LocalDate;

import static org.hamcrest.Matchers.contains;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class DashboardControllerTest {

    private static final String ROLE = "X-User-Role";

    @Autowired private MockMvc mvc;
    @Autowired private DatabaseCleaner databaseCleaner;
    @Autowired private CustomerRepository customerRepository;

    private Customer customer;
    private Long noodleId;   // 100 / min 40 -> IN_STOCK
    private Long sauceId;    // 10 / min 45  -> LOW (shortage 35)
    private Long teaId;      // 0 / min 20   -> OUT

    @BeforeEach
    void setUp() throws Exception {
        databaseCleaner.clean();
        customer = new Customer();
        customer.setName("Pacific Harvest Foods");
        customer.setAddress("Oakland, CA");
        customer = customerRepository.save(customer);
        noodleId = createProduct("LNS264", 100, 40);
        sauceId = createProduct("LNS246", 10, 45);
        teaId = createProduct("LNS217", 0, 20);
    }

    @Test
    void summary_computesKpisAndLists() throws Exception {
        Long shipped = createWholesale(noodleId, 10);                      // 10 x 10.00 = 100
        mvc.perform(post("/orders/{id}/ship", shipped).header(ROLE, "WAREHOUSE")).andExpect(status().isOk());
        Long canceled = createWholesale(noodleId, 1);
        mvc.perform(post("/orders/{id}/cancel", canceled).header(ROLE, "SALES")).andExpect(status().isOk());
        createWholesale(noodleId, 2);                                      // NEW wholesale
        Long overdue = idOf(mvc.perform(post("/orders").header(ROLE, "SALES").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"channel":"WALMART","externalOrderNo":"W-1","recipientName":"Elizabeth Lopez",
                         "shipTo":"Houston, TX","shipBy":"%s","items":[{"productId":%d,"qty":1}]}
                        """.formatted(LocalDate.now().minusDays(3), noodleId))));

        mvc.perform(get("/dashboard/summary").header(ROLE, "MANAGER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ordersToday").value(3))              // canceled excluded
                .andExpect(jsonPath("$.ordersToShip").value(2))
                .andExpect(jsonPath("$.ordersToShipByChannel.WHOLESALE").value(1))
                .andExpect(jsonPath("$.ordersToShipByChannel.WALMART").value(1))
                .andExpect(jsonPath("$.ordersToShipByChannel.AMAZON").value(0))
                .andExpect(jsonPath("$.revenueThisMonth").value(100.0))     // only the SHIPPED order
                .andExpect(jsonPath("$.lowStockCount").value(2))
                .andExpect(jsonPath("$.lowStockProducts[*].sku", contains("LNS217", "LNS246")))   // OUT first
                .andExpect(jsonPath("$.overdueCount").value(1))
                .andExpect(jsonPath("$.overdueOrders[0].id").value(overdue))
                .andExpect(jsonPath("$.overdueOrders[0].overdue").value(true))
                .andExpect(jsonPath("$.recentOrders.length()").value(4))
                .andExpect(jsonPath("$.recentOrders[0].id").value(overdue)) // newest first
                .andExpect(jsonPath("$.generatedAt").exists());
    }

    @Test
    void summary_ignoresDiscontinuedProducts() throws Exception {
        mvc.perform(patch("/products/{id}/toggle", teaId).header(ROLE, "MANAGER")).andExpect(status().isOk());
        mvc.perform(get("/dashboard/summary").header(ROLE, "MANAGER"))
                .andExpect(jsonPath("$.lowStockCount").value(1))
                .andExpect(jsonPath("$.lowStockProducts[0].productId").value(sauceId))
                .andExpect(jsonPath("$.revenueThisMonth").value(0))
                .andExpect(jsonPath("$.recentOrders.length()").value(0));
    }

    @Test
    void summary_managerOnly() throws Exception {
        mvc.perform(get("/dashboard/summary").header(ROLE, "SALES")).andExpect(status().isForbidden());
        mvc.perform(get("/dashboard/summary").header(ROLE, "WAREHOUSE")).andExpect(status().isForbidden());
    }

    private Long createWholesale(Long productId, int qty) throws Exception {
        return idOf(mvc.perform(post("/orders").header(ROLE, "SALES").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"channel":"WHOLESALE","customerId":%d,"items":[{"productId":%d,"qty":%d}]}
                        """.formatted(customer.getId(), productId, qty))));
    }

    private Long createProduct(String sku, int openingStock, int minStock) throws Exception {
        return idOf(mvc.perform(post("/products").header(ROLE, "MANAGER").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"sku":"%s","name":"%s","unitsPerCarton":12,"price":10,"minStock":%d,"stockQty":%d}
                        """.formatted(sku, sku, minStock, openingStock))));
    }

    private Long idOf(ResultActions result) throws Exception {
        result.andExpect(status().isCreated());
        String body = result.andReturn().getResponse().getContentAsString();
        return Long.valueOf(body.replaceFirst("^\\{\"id\":(\\d+).*$", "$1").trim());
    }
}
