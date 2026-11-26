package org.quangdn.his_crm_system.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.quangdn.his_crm_system.entity.Customer;
import org.quangdn.his_crm_system.entity.Product;
import org.quangdn.his_crm_system.entity.Supplier;
import org.quangdn.his_crm_system.repository.CustomerRepository;
import org.quangdn.his_crm_system.repository.InventoryTransactionRepository;
import org.quangdn.his_crm_system.repository.ProductRepository;
import org.quangdn.his_crm_system.repository.SupplierRepository;
import org.quangdn.his_crm_system.support.DatabaseCleaner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class InventoryControllerTest {

    private static final String ROLE = "X-User-Role";

    @Autowired private MockMvc mvc;
    @Autowired private DatabaseCleaner databaseCleaner;
    @Autowired private ProductRepository productRepository;
    @Autowired private InventoryTransactionRepository transactionRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private SupplierRepository supplierRepository;

    private Long noodleId;   // opening 100, min 40 -> IN_STOCK
    private Long sauceId;    // opening 10,  min 45 -> LOW
    private Long teaId;      // opening 0,   min 20 -> OUT

    @BeforeEach
    void setUp() throws Exception {
        databaseCleaner.clean();
        noodleId = createProduct("LNS264", "Meizan Egg Noodle", 100, 40);
        sauceId = createProduct("LNS246", "Sriracha 830g", 10, 45);
        teaId = createProduct("LNS217", "Cooling Herbal Tea", 0, 20);
    }

    // ---------- GET /inventory ----------

    @Test
    void list_showsStockStatusAndShortage() throws Exception {
        mvc.perform(get("/inventory").header(ROLE, "WAREHOUSE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].sku", contains("LNS217", "LNS246", "LNS264")))
                .andExpect(jsonPath("$[0].status").value("OUT"))
                .andExpect(jsonPath("$[0].shortage").value(20))
                .andExpect(jsonPath("$[1].status").value("LOW"))
                .andExpect(jsonPath("$[1].stockQty").value(10))
                .andExpect(jsonPath("$[1].minStock").value(45))
                .andExpect(jsonPath("$[1].shortage").value(35))
                .andExpect(jsonPath("$[2].status").value("IN_STOCK"))
                .andExpect(jsonPath("$[2].shortage").value(0));

        mvc.perform(get("/inventory").param("status", "LOW").header(ROLE, "WAREHOUSE"))
                .andExpect(jsonPath("$[*].sku", contains("LNS246")));
        mvc.perform(get("/inventory").header(ROLE, "SALES")).andExpect(status().isForbidden());
    }

    @Test
    void list_countsOnlyNewOrdersAsCommittedAndAddsThemToShortage() throws Exception {
        Customer customer = new Customer();
        customer.setName("Pacific Harvest Foods");
        customer.setAddress("Oakland, CA");
        Long customerId = customerRepository.save(customer).getId();

        // noodle: 100 on hand, min 40. Two NEW orders (90 + 30), one shipped (10), one canceled (500).
        Long shipped = createOrder(customerId, noodleId, 10);
        mvc.perform(post("/orders/{id}/ship", shipped).header(ROLE, "WAREHOUSE")).andExpect(status().isOk());
        Long canceled = createOrder(customerId, noodleId, 500);
        mvc.perform(post("/orders/{id}/cancel", canceled).header(ROLE, "SALES")).andExpect(status().isOk());
        createOrder(customerId, noodleId, 90);
        createOrder(customerId, noodleId, 30);

        // after the shipment: 90 on hand, 120 committed -> 120 + 40 - 90 = 70 to buy, though status is still IN_STOCK
        mvc.perform(get("/inventory").header(ROLE, "WAREHOUSE"))
                .andExpect(jsonPath("$[2].sku").value("LNS264"))
                .andExpect(jsonPath("$[2].stockQty").value(90))
                .andExpect(jsonPath("$[2].committedQty").value(120))
                .andExpect(jsonPath("$[2].status").value("IN_STOCK"))
                .andExpect(jsonPath("$[2].shortage").value(70))
                // no open orders -> committed 0, shortage is just the gap to minStock
                .andExpect(jsonPath("$[1].committedQty").value(0))
                .andExpect(jsonPath("$[1].shortage").value(35));
    }

    @Test
    void openingStock_isBookedInTheLedger() throws Exception {
        mvc.perform(get("/inventory/transactions").param("productId", noodleId.toString()).header(ROLE, "WAREHOUSE"))
                .andExpect(jsonPath("$.totalItems").value(1))
                .andExpect(jsonPath("$.items[0].type").value("IN"))
                .andExpect(jsonPath("$.items[0].refType").value("OPENING_BALANCE"))
                .andExpect(jsonPath("$.items[0].quantity").value(100))
                .andExpect(jsonPath("$.items[0].balanceAfter").value(100));
        // product created with 0 opening stock has no ledger line
        mvc.perform(get("/inventory/transactions").param("productId", teaId.toString()).header(ROLE, "WAREHOUSE"))
                .andExpect(jsonPath("$.totalItems").value(0));
        assertLedgerMatchesStock();
    }

    // ---------- POST /inventory/stock-in ----------

    @Test
    void stockIn_addsStockAndWritesManualIn() throws Exception {
        stockIn(sauceId, 20, "Customer return")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("IN"))
                .andExpect(jsonPath("$.refType").value("MANUAL"))
                .andExpect(jsonPath("$.refId").doesNotExist())
                .andExpect(jsonPath("$.quantity").value(20))
                .andExpect(jsonPath("$.balanceAfter").value(30))
                .andExpect(jsonPath("$.note").value("Customer return"))
                .andExpect(jsonPath("$.sku").value("LNS246"));

        assertThat(stock(sauceId)).isEqualTo(30);
        assertLedgerMatchesStock();
    }

    @Test
    void stockIn_validates() throws Exception {
        stockIn(sauceId, 0, null).andExpect(status().isBadRequest()).andExpect(jsonPath("$.fieldErrors.qty").exists());
        stockIn(999_999L, 5, null).andExpect(status().isNotFound());
        mvc.perform(post("/inventory/stock-in").header(ROLE, "SALES").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\":%d,\"qty\":5}".formatted(sauceId)))
                .andExpect(status().isForbidden());
    }

    // ---------- POST /inventory/damaged ----------

    @Test
    void damaged_deductsStockWithReason() throws Exception {
        damaged(noodleId, 2, "Vỡ thùng khi bốc dỡ")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("DAMAGED"))
                .andExpect(jsonPath("$.quantity").value(-2))
                .andExpect(jsonPath("$.balanceAfter").value(98))
                .andExpect(jsonPath("$.note").value("Vỡ thùng khi bốc dỡ"));

        assertThat(stock(noodleId)).isEqualTo(98);
        assertLedgerMatchesStock();
    }

    @Test
    void damaged_requiresReasonAndCannotExceedStock() throws Exception {
        damaged(sauceId, 1, " ")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.reason").exists());

        damaged(sauceId, 11, "Hết hạn")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("INSUFFICIENT_STOCK"))
                .andExpect(jsonPath("$.details[0].required").value(11))
                .andExpect(jsonPath("$.details[0].available").value(10));
        assertThat(stock(sauceId)).isEqualTo(10);

        // writing off exactly the whole stock is fine -> 0, never negative
        damaged(sauceId, 10, "Hết hạn").andExpect(status().isCreated());
        assertThat(stock(sauceId)).isZero();
        assertLedgerMatchesStock();
    }

    // ---------- GET /inventory/transactions ----------

    @Test
    void transactions_filtersAndLinksToSourceDocuments() throws Exception {
        // a shipped sales order -> OUT + SALES_ORDER
        Customer customer = new Customer();
        customer.setName("Pacific Harvest Foods");
        customer.setAddress("Oakland, CA");
        customer = customerRepository.save(customer);
        Long orderId = idOf(mvc.perform(post("/orders").header(ROLE, "SALES").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"channel":"WHOLESALE","customerId":%d,"items":[{"productId":%d,"qty":30}]}
                        """.formatted(customer.getId(), noodleId))));
        mvc.perform(post("/orders/{id}/ship", orderId).header(ROLE, "WAREHOUSE")).andExpect(status().isOk());

        // a received purchase order -> IN + PURCHASE_ORDER
        Supplier supplier = new Supplier();
        supplier.setName("Meizan Distribution USA");
        supplier = supplierRepository.save(supplier);
        Long poId = idOf(mvc.perform(post("/purchase-orders").header(ROLE, "WAREHOUSE").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"supplierId":%d,"items":[{"productId":%d,"qty":50}]}
                        """.formatted(supplier.getId(), noodleId))));
        mvc.perform(post("/purchase-orders/{id}/receive", poId).header(ROLE, "WAREHOUSE")).andExpect(status().isOk());

        damaged(noodleId, 1, "Rách bao bì");

        // newest first: DAMAGED, PO IN, SO OUT, opening IN
        mvc.perform(get("/inventory/transactions").param("productId", noodleId.toString()).header(ROLE, "MANAGER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalItems").value(4))
                .andExpect(jsonPath("$.items[*].type", contains("DAMAGED", "IN", "OUT", "IN")))
                .andExpect(jsonPath("$.items[*].balanceAfter", contains(119, 120, 70, 100)))
                .andExpect(jsonPath("$.items[1].refType").value("PURCHASE_ORDER"))
                .andExpect(jsonPath("$.items[1].refId").value(poId))
                .andExpect(jsonPath("$.items[1].refCode").value(org.hamcrest.Matchers.startsWith("PO-")))
                .andExpect(jsonPath("$.items[2].refType").value("SALES_ORDER"))
                .andExpect(jsonPath("$.items[2].refId").value(orderId))
                .andExpect(jsonPath("$.items[2].refCode").value(org.hamcrest.Matchers.startsWith("SO-")))
                .andExpect(jsonPath("$.items[2].quantity").value(-30));

        mvc.perform(get("/inventory/transactions").param("type", "OUT").header(ROLE, "WAREHOUSE"))
                .andExpect(jsonPath("$.totalItems").value(1));

        LocalDate today = LocalDate.now();
        mvc.perform(get("/inventory/transactions").param("from", today.toString()).param("to", today.toString())
                        .header(ROLE, "WAREHOUSE"))
                .andExpect(jsonPath("$.totalItems").value(5));   // 4 noodle + sauce opening; tea opened at 0 = no line
        mvc.perform(get("/inventory/transactions").param("to", today.minusDays(1).toString()).header(ROLE, "WAREHOUSE"))
                .andExpect(jsonPath("$.totalItems").value(0));
        mvc.perform(get("/inventory/transactions").param("from", today.toString()).param("to", today.minusDays(1).toString())
                        .header(ROLE, "WAREHOUSE"))
                .andExpect(status().isBadRequest());

        mvc.perform(get("/inventory/transactions").param("page", "2").param("size", "4").header(ROLE, "WAREHOUSE"))
                .andExpect(jsonPath("$.items.length()").value(1))   // 5 lines, 4 per page
                .andExpect(jsonPath("$.totalPages").value(2));

        mvc.perform(get("/inventory/transactions").header(ROLE, "SALES")).andExpect(status().isForbidden());
        assertLedgerMatchesStock();
    }

    // ---------- helpers ----------

    /** The core inventory invariant: stockQty == SUM(ledger quantity), for every product. */
    private void assertLedgerMatchesStock() {
        for (Product product : productRepository.findAll()) {
            assertThat(transactionRepository.sumQuantityByProductId(product.getId()))
                    .as("ledger of %s", product.getSku())
                    .isEqualTo(product.getStockQty().longValue());
            assertThat(product.getStockQty()).isNotNegative();
        }
    }

    private ResultActions stockIn(Long productId, int qty, String note) throws Exception {
        String body = note == null
                ? "{\"productId\":%d,\"qty\":%d}".formatted(productId, qty)
                : "{\"productId\":%d,\"qty\":%d,\"note\":\"%s\"}".formatted(productId, qty, note);
        return mvc.perform(post("/inventory/stock-in").header(ROLE, "WAREHOUSE")
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private ResultActions damaged(Long productId, int qty, String reason) throws Exception {
        return mvc.perform(post("/inventory/damaged").header(ROLE, "WAREHOUSE").contentType(MediaType.APPLICATION_JSON)
                .content("{\"productId\":%d,\"qty\":%d,\"reason\":\"%s\"}".formatted(productId, qty, reason)));
    }

    private Long createProduct(String sku, String name, int openingStock, int minStock) throws Exception {
        return idOf(mvc.perform(post("/products").header(ROLE, "MANAGER").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"sku":"%s","name":"%s","unitsPerCarton":12,"price":10,"minStock":%d,"stockQty":%d}
                        """.formatted(sku, name, minStock, openingStock))));
    }

    private Long createOrder(Long customerId, Long productId, int qty) throws Exception {
        return idOf(mvc.perform(post("/orders").header(ROLE, "SALES").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"channel":"WHOLESALE","customerId":%d,"items":[{"productId":%d,"qty":%d}]}
                        """.formatted(customerId, productId, qty))));
    }

    private int stock(Long productId) {
        return productRepository.findById(productId).orElseThrow().getStockQty();
    }

    private Long idOf(ResultActions result) throws Exception {
        result.andExpect(status().isCreated());
        String body = result.andReturn().getResponse().getContentAsString();
        return Long.valueOf(body.replaceFirst("^\\{\"id\":(\\d+).*$", "$1").trim());
    }
}
