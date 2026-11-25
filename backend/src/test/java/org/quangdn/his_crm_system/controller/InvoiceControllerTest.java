package org.quangdn.his_crm_system.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.quangdn.his_crm_system.entity.Customer;
import org.quangdn.his_crm_system.entity.Product;
import org.quangdn.his_crm_system.repository.CustomerRepository;
import org.quangdn.his_crm_system.repository.InvoiceRepository;
import org.quangdn.his_crm_system.repository.ProductRepository;
import org.quangdn.his_crm_system.repository.SalesOrderRepository;
import org.quangdn.his_crm_system.repository.InventoryTransactionRepository;
import org.quangdn.his_crm_system.support.DatabaseCleaner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class InvoiceControllerTest {

    private static final String ROLE = "X-User-Role";

    @Autowired private MockMvc mvc;
    @Autowired private DatabaseCleaner databaseCleaner;
    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private SalesOrderRepository orderRepository;
    @Autowired private InventoryTransactionRepository inventoryTransactionRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CustomerRepository customerRepository;

    private Customer customer;
    private Product noodle;
    private Product sauce;

    @BeforeEach
    void setUp() {
        databaseCleaner.clean();

        customer = new Customer();
        customer.setName("Pacific Harvest Foods");
        customer.setAddress("1420 Harbor Blvd, Oakland, CA");
        customer.setPaymentTermDays(30);
        customer = customerRepository.save(customer);

        noodle = product("LNS264", "Meizan Thin Round Egg Noodle", "35.88");
        sauce = product("LNS246", "Sriracha Chilli Sauce 830g", "47.88");
    }

    @Test
    void issue_createsInvoiceWithPrintData() throws Exception {
        Long orderId = createWholesaleOrder();
        String orderCode = orderRepository.findById(orderId).orElseThrow().getCode();
        LocalDate today = LocalDate.now();

        issue(orderId, "SALES")
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", matchesPattern(".*/invoices/\\d+")))
                .andExpect(jsonPath("$.invoiceNo").value(orderCode.replace("SO-", "INV-")))
                .andExpect(jsonPath("$.invoiceDate").value(today.toString()))
                .andExpect(jsonPath("$.paymentTermDays").value(30))
                .andExpect(jsonPath("$.dueDate").value(today.plusDays(30).toString()))
                .andExpect(jsonPath("$.voided").value(false))
                .andExpect(jsonPath("$.company.name").value("Test Foods Inc."))
                .andExpect(jsonPath("$.orderCode").value(orderCode))
                .andExpect(jsonPath("$.customerName").value("Pacific Harvest Foods"))
                .andExpect(jsonPath("$.shipTo").value("1420 Harbor Blvd, Oakland, CA"))
                .andExpect(jsonPath("$.billTo").value("1420 Harbor Blvd, Oakland, CA"))
                .andExpect(jsonPath("$.lines.length()").value(2))
                .andExpect(jsonPath("$.lines[0].lineNo").value(1))
                .andExpect(jsonPath("$.lines[0].qty").value(10))
                .andExpect(jsonPath("$.lines[0].sku").value("LNS264"))
                .andExpect(jsonPath("$.lines[0].description").value("Meizan Thin Round Egg Noodle"))
                .andExpect(jsonPath("$.lines[0].unitPrice").value(35.88))
                .andExpect(jsonPath("$.lines[0].amount").value(358.80))
                .andExpect(jsonPath("$.lines[1].amount").value(95.76))
                .andExpect(jsonPath("$.total").value(454.56))
                .andExpect(jsonPath("$.currency").value("USD"));

        // the order detail now points to the invoice
        mvc.perform(get("/orders/{id}", orderId).header(ROLE, "SALES"))
                .andExpect(jsonPath("$.invoice.invoiceNo").value(orderCode.replace("SO-", "INV-")));
    }

    @Test
    void issue_isIdempotent() throws Exception {
        Long orderId = createWholesaleOrder();
        Long invoiceId = idOf(issue(orderId, "SALES").andExpect(status().isCreated()));

        issue(orderId, "SALES")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(invoiceId));
        assertThat(invoiceRepository.count()).isEqualTo(1);
    }

    @Test
    void issue_frozenValuesDoNotFollowLaterCustomerChanges() throws Exception {
        Long orderId = createWholesaleOrder();
        Long invoiceId = idOf(issue(orderId, "SALES"));

        customer.setPaymentTermDays(60);
        customerRepository.save(customer);

        mvc.perform(get("/invoices/{id}", invoiceId).header(ROLE, "SALES"))
                .andExpect(jsonPath("$.paymentTermDays").value(30));
    }

    @Test
    void issue_allowedForShippedOrders() throws Exception {
        Long orderId = createWholesaleOrder();
        mvc.perform(post("/orders/{id}/ship", orderId).header(ROLE, "WAREHOUSE")).andExpect(status().isOk());
        issue(orderId, "SALES").andExpect(status().isCreated());
    }

    @Test
    void issue_rejectsCanceledOrders() throws Exception {
        Long orderId = createWholesaleOrder();
        mvc.perform(post("/orders/{id}/cancel", orderId).header(ROLE, "SALES")).andExpect(status().isOk());

        issue(orderId, "SALES")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("INVALID_STATUS"));
        assertThat(invoiceRepository.count()).isZero();
    }

    @Test
    void invoiceOfOrderCanceledLater_isMarkedVoid() throws Exception {
        Long orderId = createWholesaleOrder();
        Long invoiceId = idOf(issue(orderId, "SALES"));
        mvc.perform(post("/orders/{id}/cancel", orderId).header(ROLE, "SALES")).andExpect(status().isOk());

        mvc.perform(get("/invoices/{id}", invoiceId).header(ROLE, "SALES"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.voided").value(true));
    }

    @Test
    void marketplaceInvoice_showsBuyerAndMarketplaceOrderNo() throws Exception {
        Long orderId = idOf(mvc.perform(post("/orders").header(ROLE, "SALES").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"channel":"WALMART","externalOrderNo":"200013751032753","recipientName":"Elizabeth Lopez",
                         "shipTo":"12002 Fairpoint Dr, Houston, TX 77099","items":[{"productId":%d,"qty":1}]}
                        """.formatted(noodle.getId()))));

        issue(orderId, "SALES")
                .andExpect(jsonPath("$.channel").value("WALMART"))
                .andExpect(jsonPath("$.externalOrderNo").value("200013751032753"))
                .andExpect(jsonPath("$.customerName").value("Walmart Marketplace"))
                .andExpect(jsonPath("$.recipientName").value("Elizabeth Lopez"))
                .andExpect(jsonPath("$.billTo", endsWith("TX 77099")))   // no bill-to given -> ship-to
                .andExpect(jsonPath("$.paymentTermDays").value(0));
    }

    @Test
    void errorsAndRoles() throws Exception {
        issue(999_999L, "SALES").andExpect(status().isNotFound());
        mvc.perform(get("/invoices/{id}", 999_999).header(ROLE, "SALES")).andExpect(status().isNotFound());

        Long orderId = createWholesaleOrder();
        issue(orderId, "WAREHOUSE").andExpect(status().isForbidden());
        Long invoiceId = idOf(issue(orderId, "SALES"));
        mvc.perform(get("/invoices/{id}", invoiceId).header(ROLE, "WAREHOUSE")).andExpect(status().isForbidden());
        mvc.perform(get("/invoices/{id}", invoiceId).header(ROLE, "MANAGER")).andExpect(status().isOk());
    }

    // ---------- helpers ----------

    private ResultActions issue(Long orderId, String role) throws Exception {
        return mvc.perform(post("/orders/{id}/invoice", orderId).header(ROLE, role));
    }

    private Long createWholesaleOrder() throws Exception {
        return idOf(mvc.perform(post("/orders").header(ROLE, "SALES").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"channel":"WHOLESALE","customerId":%d,
                         "items":[{"productId":%d,"qty":10},{"productId":%d,"qty":2}]}
                        """.formatted(customer.getId(), noodle.getId(), sauce.getId()))));
    }

    private Long idOf(ResultActions result) throws Exception {
        String body = result.andReturn().getResponse().getContentAsString();
        return Long.valueOf(body.replaceFirst("^\\{\"id\":(\\d+).*$", "$1").trim());
    }

    private Product product(String sku, String name, String price) {
        Product p = new Product();
        p.setSku(sku);
        p.setName(name);
        p.setPackSize("500g x 12");
        p.setUnitsPerCarton(12);
        p.setPrice(new BigDecimal(price));
        p.setStockQty(100);
        p.setMinStock(10);
        return productRepository.save(p);
    }
}
