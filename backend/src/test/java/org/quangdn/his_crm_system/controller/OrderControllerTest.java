package org.quangdn.his_crm_system.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.quangdn.his_crm_system.entity.Customer;
import org.quangdn.his_crm_system.entity.Product;
import org.quangdn.his_crm_system.enums.StockTransactionType;
import org.quangdn.his_crm_system.repository.InvoiceRepository;
import org.quangdn.his_crm_system.repository.CustomerRepository;
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
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerTest {

    private static final String ROLE = "X-User-Role";

    @Autowired private MockMvc mvc;
    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private SalesOrderRepository orderRepository;
    @Autowired private StockTransactionRepository stockTransactionRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CustomerRepository customerRepository;

    private Customer customer;
    private Product noodle;   // stock 100
    private Product sauce;    // stock 3

    @BeforeEach
    void setUp() {
        stockTransactionRepository.deleteAll();
        invoiceRepository.deleteAll();
        orderRepository.deleteAll();
        productRepository.deleteAll();
        customerRepository.deleteAll();

        customer = new Customer();
        customer.setName("Pacific Harvest Foods");
        customer.setAddress("1420 Harbor Blvd, Oakland, CA");
        customer.setPaymentTermDays(30);
        customer = customerRepository.save(customer);

        noodle = product("LNS264", "Meizan Egg Noodle", "35.88", 100);
        sauce = product("LNS246", "Sriracha 830g", "47.88", 3);
    }

    // ---------- customers ----------

    @Test
    void customers_createAndList() throws Exception {
        mvc.perform(post("/customers").header(ROLE, "SALES").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Golden Gate Market","phone":"415-555","email":"gg@example.com"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.paymentTermDays").value(0));

        mvc.perform(get("/customers").header(ROLE, "SALES"))
                .andExpect(jsonPath("$[*].name", contains("Golden Gate Market", "Pacific Harvest Foods")));
        mvc.perform(get("/customers").param("q", "golden").header(ROLE, "SALES"))
                .andExpect(jsonPath("$", hasSize(1)));

        mvc.perform(post("/customers").header(ROLE, "SALES").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"\",\"email\":\"not-an-email\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.fieldErrors.name").exists())
                .andExpect(jsonPath("$.fieldErrors.email").exists());

        mvc.perform(get("/customers").header(ROLE, "WAREHOUSE")).andExpect(status().isForbidden());
    }

    // ---------- create ----------

    @Test
    void create_snapshotsPricesAndComputesTotals() throws Exception {
        createOrder("""
                {"channel":"WALMART","externalOrderNo":"200013751032753","recipientName":"Elizabeth Lopez",
                 "shipTo":"12002 Fairpoint Dr, Houston, TX 77099","billTo":"1927 Lombardy St, Houston, TX 77023",
                 "shipBy":"2099-01-01",
                 "items":[{"productId":%d,"qty":10},{"productId":%d,"qty":2}]}
                """.formatted(noodle.getId(), sauce.getId()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code", matchesPattern("SO-\\d{4}-\\d{4}")))
                .andExpect(jsonPath("$.status").value("NEW"))
                .andExpect(jsonPath("$.customer.name").value("Walmart Marketplace"))
                .andExpect(jsonPath("$.customer.marketplaceChannel").value("WALMART"))
                .andExpect(jsonPath("$.recipientName").value("Elizabeth Lopez"))
                .andExpect(jsonPath("$.items[0].unitPrice").value(35.88))
                .andExpect(jsonPath("$.items[0].lineTotal").value(358.80))
                .andExpect(jsonPath("$.items[1].lineTotal").value(95.76))
                .andExpect(jsonPath("$.total").value(454.56))
                .andExpect(jsonPath("$.customer.paymentTermDays").value(0))
                .andExpect(jsonPath("$.invoice").doesNotExist());

        // changing the catalogue price later must not change the order
        noodle.setPrice(new BigDecimal("99.00"));
        productRepository.save(noodle);
        Long id = orderRepository.findAll().getFirst().getId();
        mvc.perform(get("/orders/{id}", id).header(ROLE, "SALES"))
                .andExpect(jsonPath("$.items[0].unitPrice").value(35.88));
    }

    @Test
    void create_wholesaleFallsBackToCustomerAddress() throws Exception {
        createOrder(wholesale(noodle.getId(), 1))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.shipTo").value("1420 Harbor Blvd, Oakland, CA"))
                .andExpect(jsonPath("$.recipientName").value("Pacific Harvest Foods"))
                .andExpect(jsonPath("$.customer.paymentTermDays").value(30))
                .andExpect(jsonPath("$.externalOrderNo").doesNotExist());
    }

    @Test
    void create_customerMustMatchChannel() throws Exception {
        // wholesale needs a customer
        createOrder("""
                {"channel":"WHOLESALE","items":[{"productId":%d,"qty":1}]}
                """.formatted(noodle.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.customerId").exists());

        // a wholesale customer cannot be put on a Walmart order
        createOrder("""
                {"channel":"WALMART","externalOrderNo":"W-9","customerId":%d,"recipientName":"A","shipTo":"B",
                 "items":[{"productId":%d,"qty":1}]}
                """.formatted(customer.getId(), noodle.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.customerId").exists());

        // ...and the Walmart account cannot be used for wholesale
        Long walmartOrderId = idOf(createOrder(walmart("W-10")));
        Long accountId = orderRepository.findDetailById(walmartOrderId).orElseThrow().getCustomer().getId();
        createOrder("""
                {"channel":"WHOLESALE","customerId":%d,"items":[{"productId":%d,"qty":1}]}
                """.formatted(accountId, noodle.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.customerId").exists());

        // passing the right marketplace account explicitly is fine
        createOrder("""
                {"channel":"WALMART","externalOrderNo":"W-11","customerId":%d,"recipientName":"A","shipTo":"B",
                 "items":[{"productId":%d,"qty":1}]}
                """.formatted(accountId, noodle.getId()))
                .andExpect(status().isCreated());

        // exactly one Walmart account exists, and the dropdown filter finds it / hides it
        mvc.perform(get("/customers").param("channel", "WALMART").header(ROLE, "SALES"))
                .andExpect(jsonPath("$[*].name", contains("Walmart Marketplace")));
        mvc.perform(get("/customers").param("channel", "WHOLESALE").header(ROLE, "SALES"))
                .andExpect(jsonPath("$[*].name", contains("Pacific Harvest Foods")));
    }

    @Test
    void create_marketplaceNeedsRecipientAndShipTo() throws Exception {
        createOrder("""
                {"channel":"AMAZON","externalOrderNo":"A-1","shipTo":"Somewhere","items":[{"productId":%d,"qty":1}]}
                """.formatted(noodle.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.recipientName").exists());

        createOrder("""
                {"channel":"AMAZON","externalOrderNo":"A-1","recipientName":"Bob","items":[{"productId":%d,"qty":1}]}
                """.formatted(noodle.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.shipTo").exists());
    }

    @Test
    void create_externalOrderNoRulesPerChannel() throws Exception {
        createOrder("""
                {"channel":"AMAZON","customerId":%d,"items":[{"productId":%d,"qty":1}]}
                """.formatted(customer.getId(), noodle.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.externalOrderNo").exists());

        createOrder("""
                {"channel":"WHOLESALE","externalOrderNo":"X1","customerId":%d,"items":[{"productId":%d,"qty":1}]}
                """.formatted(customer.getId(), noodle.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.externalOrderNo").exists());

        createOrder(walmart("W-1")).andExpect(status().isCreated());
        createOrder(walmart("W-1"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("DUPLICATE_RESOURCE"));
    }

    @Test
    void create_rejectsBadItems() throws Exception {
        createOrder("""
                {"channel":"WHOLESALE","customerId":%d,"items":[]}
                """.formatted(customer.getId()))
                .andExpect(status().isBadRequest());

        createOrder("""
                {"channel":"WHOLESALE","customerId":%d,"items":[{"productId":%d,"qty":0}]}
                """.formatted(customer.getId(), noodle.getId()))
                .andExpect(status().isBadRequest());

        createOrder("""
                {"channel":"WHOLESALE","customerId":%d,"items":[{"productId":%d,"qty":1},{"productId":%d,"qty":2}]}
                """.formatted(customer.getId(), noodle.getId(), noodle.getId()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.items").exists());

        createOrder(wholesale(999_999L, 1)).andExpect(status().isNotFound());

        createOrder("""
                {"channel":"WHOLESALE","customerId":999999,"items":[{"productId":%d,"qty":1}]}
                """.formatted(noodle.getId()))
                .andExpect(status().isNotFound());
    }

    @Test
    void create_rejectsDiscontinuedProduct() throws Exception {
        noodle.setActive(false);
        productRepository.save(noodle);
        createOrder(wholesale(noodle.getId(), 1))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("BUSINESS_RULE_VIOLATION"));
    }

    @Test
    void create_onlySales() throws Exception {
        mvc.perform(post("/orders").header(ROLE, "WAREHOUSE").contentType(MediaType.APPLICATION_JSON)
                        .content(wholesale(noodle.getId(), 1)))
                .andExpect(status().isForbidden());
    }

    // ---------- list / detail ----------

    @Test
    void list_filtersAndFlagsOverdue() throws Exception {
        Long overdueId = idOf(createOrder("""
                {"channel":"WALMART","externalOrderNo":"W-OLD","recipientName":"Elizabeth Lopez",
                 "shipTo":"12002 Fairpoint Dr","shipBy":"%s","items":[{"productId":%d,"qty":1}]}
                """.formatted(LocalDate.now().minusDays(2), noodle.getId())));
        createOrder(wholesale(noodle.getId(), 1));

        mvc.perform(get("/orders").header(ROLE, "SALES"))
                .andExpect(jsonPath("$.totalItems").value(2))
                .andExpect(jsonPath("$.items[1].id").value(overdueId))   // newest first
                .andExpect(jsonPath("$.items[1].overdue").value(true))
                .andExpect(jsonPath("$.items[0].overdue").value(false))
                .andExpect(jsonPath("$.items[0].customerName").value("Pacific Harvest Foods"));

        mvc.perform(get("/orders").param("channel", "WALMART").header(ROLE, "WAREHOUSE"))
                .andExpect(jsonPath("$.totalItems").value(1));
        mvc.perform(get("/orders").param("q", "w-old").header(ROLE, "SALES"))
                .andExpect(jsonPath("$.totalItems").value(1));
        mvc.perform(get("/orders").param("q", "pacific").header(ROLE, "SALES"))
                .andExpect(jsonPath("$.totalItems").value(1));
        mvc.perform(get("/orders").param("q", "lopez").header(ROLE, "SALES"))       // marketplace buyer
                .andExpect(jsonPath("$.items[0].recipientName").value("Elizabeth Lopez"))
                .andExpect(jsonPath("$.items[0].customerName").value("Walmart Marketplace"));
        mvc.perform(get("/orders").param("status", "SHIPPED").header(ROLE, "SALES"))
                .andExpect(jsonPath("$.totalItems").value(0));

        // a shipped order is never overdue
        mvc.perform(post("/orders/{id}/ship", overdueId).header(ROLE, "WAREHOUSE")).andExpect(status().isOk());
        mvc.perform(get("/orders").param("status", "SHIPPED").header(ROLE, "SALES"))
                .andExpect(jsonPath("$.items[0].overdue").value(false));
    }

    @Test
    void detail_showsAvailableStockPerLine() throws Exception {
        Long id = idOf(createOrder(twoLines(5, 10)));   // sauce has only 3
        mvc.perform(get("/orders/{id}", id).header(ROLE, "WAREHOUSE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].availableStock").value(100))
                .andExpect(jsonPath("$.items[0].enoughStock").value(true))
                .andExpect(jsonPath("$.items[1].availableStock").value(3))
                .andExpect(jsonPath("$.items[1].enoughStock").value(false))
                .andExpect(jsonPath("$.canShip").value(false));

        mvc.perform(get("/orders/{id}", 999_999).header(ROLE, "SALES")).andExpect(status().isNotFound());
    }

    // ---------- ship ----------

    @Test
    void ship_deductsStockWritesOutTransactionsAndMarksShipped() throws Exception {
        Long id = idOf(createOrder(twoLines(12, 3)));

        mvc.perform(post("/orders/{id}/ship", id).header(ROLE, "WAREHOUSE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SHIPPED"))
                .andExpect(jsonPath("$.shippedAt").exists());

        assertThat(stock(noodle)).isEqualTo(88);
        assertThat(stock(sauce)).isZero();

        String code = orderRepository.findById(id).orElseThrow().getCode();
        var txs = stockTransactionRepository.findByReferenceOrderByIdAsc(code);
        assertThat(txs).hasSize(2).allSatisfy(tx -> assertThat(tx.getType()).isEqualTo(StockTransactionType.OUT));
        assertThat(txs).extracting(tx -> tx.getQuantity()).containsExactlyInAnyOrder(12, 3);
        assertThat(txs).extracting(tx -> tx.getBalanceAfter()).containsExactlyInAnyOrder(88, 0);

        // shipping twice is rejected
        mvc.perform(post("/orders/{id}/ship", id).header(ROLE, "WAREHOUSE"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("INVALID_STATUS"));
    }

    @Test
    void ship_insufficientStockRollsBackEverything() throws Exception {
        Long id = idOf(createOrder(twoLines(12, 5)));   // noodle OK, sauce short (3 < 5)

        mvc.perform(post("/orders/{id}/ship", id).header(ROLE, "WAREHOUSE"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("INSUFFICIENT_STOCK"))
                .andExpect(jsonPath("$.message", matchesPattern("Không đủ tồn kho để giao đơn SO-.*")))
                .andExpect(jsonPath("$.details", hasSize(1)))
                .andExpect(jsonPath("$.details[0].sku").value("LNS246"))
                .andExpect(jsonPath("$.details[0].required").value(5))
                .andExpect(jsonPath("$.details[0].available").value(3));

        // the line that *did* have stock was not deducted either
        assertThat(stock(noodle)).isEqualTo(100);
        assertThat(stock(sauce)).isEqualTo(3);
        assertThat(stockTransactionRepository.count()).isZero();
        mvc.perform(get("/orders/{id}", id).header(ROLE, "SALES")).andExpect(jsonPath("$.status").value("NEW"));
    }

    @Test
    void ship_onlyWarehouse() throws Exception {
        Long id = idOf(createOrder(wholesale(noodle.getId(), 1)));
        mvc.perform(post("/orders/{id}/ship", id).header(ROLE, "SALES")).andExpect(status().isForbidden());
    }

    // ---------- cancel ----------

    @Test
    void cancel_newOrderLeavesStockUntouched() throws Exception {
        Long id = idOf(createOrder(wholesale(noodle.getId(), 10)));

        mvc.perform(post("/orders/{id}/cancel", id).header(ROLE, "SALES"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELED"))
                .andExpect(jsonPath("$.canceledAt").exists());
        assertThat(stock(noodle)).isEqualTo(100);

        mvc.perform(post("/orders/{id}/ship", id).header(ROLE, "WAREHOUSE"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("INVALID_STATUS"));
        mvc.perform(post("/orders/{id}/cancel", id).header(ROLE, "SALES"))
                .andExpect(status().isConflict());
    }

    @Test
    void cancel_shippedOrderIsRejected() throws Exception {
        Long id = idOf(createOrder(wholesale(noodle.getId(), 1)));
        mvc.perform(post("/orders/{id}/ship", id).header(ROLE, "WAREHOUSE")).andExpect(status().isOk());
        mvc.perform(post("/orders/{id}/cancel", id).header(ROLE, "SALES"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("INVALID_STATUS"));
        mvc.perform(post("/orders/{id}/cancel", id).header(ROLE, "WAREHOUSE")).andExpect(status().isForbidden());
    }

    // ---------- helpers ----------

    private ResultActions createOrder(String json) throws Exception {
        return mvc.perform(post("/orders").header(ROLE, "SALES").contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private Long idOf(ResultActions created) throws Exception {
        created.andExpect(status().isCreated());
        String body = created.andReturn().getResponse().getContentAsString();
        return Long.valueOf(body.replaceFirst("^\\{\"id\":(\\d+).*$", "$1").trim());
    }

    private String wholesale(Long productId, int qty) {
        return """
                {"channel":"WHOLESALE","customerId":%d,"items":[{"productId":%d,"qty":%d}]}
                """.formatted(customer.getId(), productId, qty);
    }

    private String walmart(String externalOrderNo) {
        return """
                {"channel":"WALMART","externalOrderNo":"%s","recipientName":"Elizabeth Lopez",
                 "shipTo":"12002 Fairpoint Dr, Houston, TX 77099","items":[{"productId":%d,"qty":1}]}
                """.formatted(externalOrderNo, noodle.getId());
    }

    private String twoLines(int noodleQty, int sauceQty) {
        return """
                {"channel":"WHOLESALE","customerId":%d,
                 "items":[{"productId":%d,"qty":%d},{"productId":%d,"qty":%d}]}
                """.formatted(customer.getId(), noodle.getId(), noodleQty, sauce.getId(), sauceQty);
    }

    private int stock(Product p) {
        return productRepository.findById(p.getId()).orElseThrow().getStockQty();
    }

    private Product product(String sku, String name, String price, int stock) {
        Product p = new Product();
        p.setSku(sku);
        p.setName(name);
        p.setPackSize("500g x 12");
        p.setUnitsPerCarton(12);
        p.setPrice(new BigDecimal(price));
        p.setStockQty(stock);
        p.setMinStock(10);
        return productRepository.save(p);
    }
}
