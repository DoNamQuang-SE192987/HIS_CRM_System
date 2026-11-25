package org.quangdn.his_crm_system.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.quangdn.his_crm_system.entity.Supplier;
import org.quangdn.his_crm_system.enums.InventoryRefType;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PurchaseOrderControllerTest {

    private static final String ROLE = "X-User-Role";

    @Autowired private MockMvc mvc;
    @Autowired private DatabaseCleaner databaseCleaner;
    @Autowired private SupplierRepository supplierRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private InventoryTransactionRepository transactionRepository;

    private Supplier meizan;
    private Long noodleId;     // stock 5,  min 40 -> LOW
    private Long vermicelliId; // stock 0,  min 40 -> OUT

    @BeforeEach
    void setUp() throws Exception {
        databaseCleaner.clean();
        meizan = supplier("Meizan Distribution USA", 14);
        supplier("Nam Duong Foods Import", 10);
        noodleId = createProduct("LNS264", "Meizan Egg Noodle", 5);
        vermicelliId = createProduct("LNS260", "Meizan Rice Vermicelli", 0);
    }

    @Test
    void suppliers_listedByName() throws Exception {
        mvc.perform(get("/suppliers").header(ROLE, "WAREHOUSE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].name", contains("Meizan Distribution USA", "Nam Duong Foods Import")))
                .andExpect(jsonPath("$[0].leadTimeDays").value(14));
        mvc.perform(get("/suppliers").header(ROLE, "SALES")).andExpect(status().isForbidden());
    }

    @Test
    void create_makesOrderedPoWithoutTouchingStock() throws Exception {
        createPo("""
                {"supplierId":%d,"expectedDate":"2099-01-15","note":"Urgent",
                 "items":[{"productId":%d,"qty":50},{"productId":%d,"qty":80}]}
                """.formatted(meizan.getId(), noodleId, vermicelliId))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", matchesPattern(".*/purchase-orders/\\d+")))
                .andExpect(jsonPath("$.code", matchesPattern("PO-\\d{4}-\\d{4}")))
                .andExpect(jsonPath("$.status").value("ORDERED"))
                .andExpect(jsonPath("$.supplier.name").value("Meizan Distribution USA"))
                .andExpect(jsonPath("$.expectedDate").value("2099-01-15"))
                .andExpect(jsonPath("$.totalQty").value(130))
                .andExpect(jsonPath("$.items[0].sku").value("LNS264"))
                .andExpect(jsonPath("$.items[0].qty").value(50))
                .andExpect(jsonPath("$.items[0].currentStock").value(5))
                .andExpect(jsonPath("$.items[0].stockStatus").value("LOW"))
                .andExpect(jsonPath("$.receivedAt").doesNotExist());

        assertThat(stock(noodleId)).isEqualTo(5);
    }

    @Test
    void create_validates() throws Exception {
        createPo("{\"supplierId\":%d,\"items\":[]}".formatted(meizan.getId()))
                .andExpect(status().isBadRequest());
        createPo("""
                {"supplierId":%d,"items":[{"productId":%d,"qty":0}]}
                """.formatted(meizan.getId(), noodleId))
                .andExpect(status().isBadRequest());
        createPo("""
                {"supplierId":%d,"items":[{"productId":%d,"qty":1},{"productId":%d,"qty":2}]}
                """.formatted(meizan.getId(), noodleId, noodleId))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.items").exists());
        createPo("""
                {"supplierId":999999,"items":[{"productId":%d,"qty":1}]}
                """.formatted(noodleId))
                .andExpect(status().isNotFound());

        // discontinued products are not reordered
        mvc.perform(patch("/products/{id}/toggle", vermicelliId).header(ROLE, "MANAGER")).andExpect(status().isOk());
        createPo("""
                {"supplierId":%d,"items":[{"productId":%d,"qty":1}]}
                """.formatted(meizan.getId(), vermicelliId))
                .andExpect(status().isUnprocessableContent());

        mvc.perform(post("/purchase-orders").header(ROLE, "SALES").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"supplierId\":%d,\"items\":[{\"productId\":%d,\"qty\":1}]}".formatted(meizan.getId(), noodleId)))
                .andExpect(status().isForbidden());
    }

    @Test
    void receive_addsStockOnceAndWritesPurchaseOrderIn() throws Exception {
        Long poId = idOf(createPo("""
                {"supplierId":%d,"items":[{"productId":%d,"qty":50},{"productId":%d,"qty":80}]}
                """.formatted(meizan.getId(), noodleId, vermicelliId)));

        mvc.perform(post("/purchase-orders/{id}/receive", poId).header(ROLE, "WAREHOUSE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RECEIVED"))
                .andExpect(jsonPath("$.receivedAt").exists())
                .andExpect(jsonPath("$.items[0].currentStock").value(55))
                .andExpect(jsonPath("$.items[0].stockStatus").value("IN_STOCK"))
                .andExpect(jsonPath("$.items[1].currentStock").value(80));

        assertThat(stock(noodleId)).isEqualTo(55);
        assertThat(stock(vermicelliId)).isEqualTo(80);
        var txs = transactionRepository.findByRefTypeAndRefIdOrderByIdAsc(InventoryRefType.PURCHASE_ORDER, poId);
        assertThat(txs).extracting(tx -> tx.getQuantity()).containsExactly(50, 80);

        // receiving twice is rejected and stock is not added again
        mvc.perform(post("/purchase-orders/{id}/receive", poId).header(ROLE, "WAREHOUSE"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("INVALID_STATUS"));
        assertThat(stock(noodleId)).isEqualTo(55);
        assertThat(transactionRepository.sumQuantityByProductId(noodleId)).isEqualTo(55);
    }

    @Test
    void receive_errorsAndRoles() throws Exception {
        mvc.perform(post("/purchase-orders/{id}/receive", 999_999).header(ROLE, "WAREHOUSE"))
                .andExpect(status().isNotFound());
        Long poId = idOf(createPo("""
                {"supplierId":%d,"items":[{"productId":%d,"qty":1}]}
                """.formatted(meizan.getId(), noodleId)));
        mvc.perform(post("/purchase-orders/{id}/receive", poId).header(ROLE, "MANAGER"))
                .andExpect(status().isForbidden());
    }

    @Test
    void list_filtersByStatusNewestFirst() throws Exception {
        Long first = idOf(createPo("""
                {"supplierId":%d,"items":[{"productId":%d,"qty":10},{"productId":%d,"qty":5}]}
                """.formatted(meizan.getId(), noodleId, vermicelliId)));
        Long second = idOf(createPo("""
                {"supplierId":%d,"items":[{"productId":%d,"qty":20}]}
                """.formatted(meizan.getId(), noodleId)));
        mvc.perform(post("/purchase-orders/{id}/receive", first).header(ROLE, "WAREHOUSE")).andExpect(status().isOk());

        mvc.perform(get("/purchase-orders").header(ROLE, "WAREHOUSE"))
                .andExpect(jsonPath("$.totalItems").value(2))
                .andExpect(jsonPath("$.items[*].id", contains(second.intValue(), first.intValue())))
                .andExpect(jsonPath("$.items[1].supplierName").value("Meizan Distribution USA"))
                .andExpect(jsonPath("$.items[1].lineCount").value(2))
                .andExpect(jsonPath("$.items[1].totalQty").value(15));

        mvc.perform(get("/purchase-orders").param("status", "ORDERED").header(ROLE, "WAREHOUSE"))
                .andExpect(jsonPath("$.items[*].id", contains(second.intValue())));
        mvc.perform(get("/purchase-orders").param("status", "RECEIVED").header(ROLE, "MANAGER"))
                .andExpect(jsonPath("$.items[*].id", contains(first.intValue())));

        mvc.perform(get("/purchase-orders/{id}", first).header(ROLE, "WAREHOUSE"))
                .andExpect(jsonPath("$.status").value("RECEIVED"))
                .andExpect(jsonPath("$.items.length()").value(2));
        mvc.perform(get("/purchase-orders/{id}", 999_999).header(ROLE, "WAREHOUSE")).andExpect(status().isNotFound());
        mvc.perform(get("/purchase-orders").header(ROLE, "SALES")).andExpect(status().isForbidden());
    }

    // ---------- helpers ----------

    private ResultActions createPo(String json) throws Exception {
        return mvc.perform(post("/purchase-orders").header(ROLE, "WAREHOUSE")
                .contentType(MediaType.APPLICATION_JSON).content(json));
    }

    private Supplier supplier(String name, int leadTimeDays) {
        Supplier s = new Supplier();
        s.setName(name);
        s.setLeadTimeDays(leadTimeDays);
        return supplierRepository.save(s);
    }

    private Long createProduct(String sku, String name, int openingStock) throws Exception {
        return idOf(mvc.perform(post("/products").header(ROLE, "MANAGER").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"sku":"%s","name":"%s","unitsPerCarton":12,"price":10,"minStock":40,"stockQty":%d}
                        """.formatted(sku, name, openingStock))));
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
