package org.quangdn.his_crm_system.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.quangdn.his_crm_system.entity.Product;
import org.quangdn.his_crm_system.entity.SalesOrder;
import org.quangdn.his_crm_system.enums.SalesChannel;
import org.quangdn.his_crm_system.repository.InvoiceRepository;
import org.quangdn.his_crm_system.repository.CustomerRepository;
import org.quangdn.his_crm_system.repository.ProductRepository;
import org.quangdn.his_crm_system.repository.SalesOrderRepository;
import org.quangdn.his_crm_system.repository.InventoryTransactionRepository;
import org.quangdn.his_crm_system.support.DatabaseCleaner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class OrderImportTest {

    private static final String ROLE = "X-User-Role";

    @Autowired private MockMvc mvc;
    @Autowired private DatabaseCleaner databaseCleaner;
    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private SalesOrderRepository orderRepository;
    @Autowired private InventoryTransactionRepository inventoryTransactionRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CustomerRepository customerRepository;

    private Product noodle;
    private Product tea;

    @BeforeEach
    void setUp() {
        databaseCleaner.clean();

        noodle = product("LNS264", "Meizan Egg Noodle", "35.88", 100, true);
        tea = product("LNS217", "Cooling Herbal Tea", "24.00", 100, true);
        product("LNS999", "Discontinued thing", "1.00", 100, false);
    }

    private static final String WALMART_CSV = """
            Order#,Order Date,Ship By,Customer Name,Ship To Address,Bill To Address,SKU,Qty
            200013751032753,09/26/2025,09/29/2025,Elizabeth Lopez,"12002 Fairpoint Dr, Houston, TX 77099","1927 Lombardy St, Houston, TX 77023",LNS264,1
            200013746358302,2025-09-26,2025-09-29,soo yoon hwang,"8800 Bellaire Blvd, Houston, TX 77036",,lns217,2
            200013746358302,2025-09-26,2025-09-29,soo yoon hwang,"8800 Bellaire Blvd, Houston, TX 77036",,LNS264,3
            200013746358302,2025-09-26,2025-09-29,soo yoon hwang,"8800 Bellaire Blvd, Houston, TX 77036",,LNS217,1
            200013462096799,2025-09-26,2025-09-29,Priscilla Luu,"1 Main St, Houston, TX",,NOPE-1,1
            200013462096800,2025-09-26,2025-09-29,Bad Qty,"1 Main St, Houston, TX",,LNS264,zero
            200013462096801,2025-09-26,2025-09-29,Old Product,"1 Main St, Houston, TX",,LNS999,1
            """;

    @Test
    void walmartCsv_createsGroupsAndReportsPerOrder() throws Exception {
        upload("WALMART", "﻿" + WALMART_CSV)            // with Excel BOM
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalOrders").value(5))
                .andExpect(jsonPath("$.created").value(2))
                .andExpect(jsonPath("$.failed").value(3))
                .andExpect(jsonPath("$.results[0].status").value("CREATED"))
                .andExpect(jsonPath("$.results[0].orderCode", startsWith("SO-2025-")))
                .andExpect(jsonPath("$.results[1].lines.length()").value(3))
                .andExpect(jsonPath("$.results[2].status").value("FAILED"))
                .andExpect(jsonPath("$.results[2].message", containsString("unknown SKU 'NOPE-1'")))
                .andExpect(jsonPath("$.results[3].message", containsString("line 7: quantity")))
                .andExpect(jsonPath("$.results[4].message", containsString("discontinued")));

        SalesOrder lopez = order("200013751032753");
        assertThat(lopez.getRecipientName()).isEqualTo("Elizabeth Lopez");
        assertThat(lopez.getShipTo()).isEqualTo("12002 Fairpoint Dr, Houston, TX 77099");
        assertThat(lopez.getBillTo()).isEqualTo("1927 Lombardy St, Houston, TX 77023");
        assertThat(lopez.getOrderDate()).isEqualTo(LocalDate.of(2025, 9, 26));
        assertThat(lopez.getShipBy()).isEqualTo(LocalDate.of(2025, 9, 29));
        assertThat(lopez.getCustomer().getName()).isEqualTo("Walmart Marketplace");

        // 3 rows, same SKU twice -> 2 lines: LNS217 x3, LNS264 x3
        SalesOrder soo = order("200013746358302");
        assertThat(soo.getItems()).hasSize(2);
        assertThat(soo.getItems()).extracting(i -> i.getSku() + "x" + i.getQty())
                .containsExactlyInAnyOrder("LNS217x3", "LNS264x3");
        assertThat(soo.getTotal()).isEqualByComparingTo("179.64");   // 3*24.00 + 3*35.88

        // importing never touches stock - only shipping does
        assertThat(productRepository.findById(noodle.getId()).orElseThrow().getStockQty()).isEqualTo(100);
        assertThat(productRepository.findById(tea.getId()).orElseThrow().getStockQty()).isEqualTo(100);
    }

    @Test
    void reUploadingTheSameFile_skipsExistingOrders() throws Exception {
        upload("WALMART", WALMART_CSV).andExpect(jsonPath("$.created").value(2));

        upload("WALMART", WALMART_CSV)
                .andExpect(jsonPath("$.created").value(0))
                .andExpect(jsonPath("$.skipped").value(2))
                .andExpect(jsonPath("$.results[0].status").value("SKIPPED"))
                .andExpect(jsonPath("$.results[0].message", startsWith("already in the system as SO-")));
        assertThat(orderRepository.count()).isEqualTo(2);
    }

    @Test
    void amazonTsv_withSplitAddressColumns() throws Exception {
        String tsv = """
                order-id\tpurchase-date\trecipient-name\tship-address-1\tship-city\tship-state\tship-postal-code\tsku\tquantity-purchased
                112-3344556-7788990\t2025-09-26T18:22:05+00:00\tJohn Tran\t500 Elm St\tDallas\tTX\t75201\tLNS264\t4
                """;
        upload("AMAZON", tsv)
                .andExpect(jsonPath("$.created").value(1));

        SalesOrder order = order("112-3344556-7788990");
        assertThat(order.getChannel()).isEqualTo(SalesChannel.AMAZON);
        assertThat(order.getShipTo()).isEqualTo("500 Elm St, Dallas, TX 75201");
        assertThat(order.getCustomer().getName()).isEqualTo("Amazon Marketplace");
    }

    @Test
    void rejectsBadFiles() throws Exception {
        upload("WALMART", "Order#,SKU\n1,LNS264\n")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.file", containsString("Qty")));

        upload("WALMART", "Order#,Customer Name,Ship To Address,SKU,Qty\n")
                .andExpect(status().isBadRequest());

        upload("WHOLESALE", WALMART_CSV)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.channel").exists());
    }

    @Test
    void onlySalesCanImport() throws Exception {
        mvc.perform(multipart("/orders/import").file(file(WALMART_CSV)).param("channel", "WALMART")
                        .header(ROLE, "WAREHOUSE"))
                .andExpect(status().isForbidden());
    }

    @Test
    void templateIsDownloadableAndImportable() throws Exception {
        product("LNS246", "Sriracha 830g", "47.88", 100, true);   // the template uses real catalogue SKUs

        String template = mvc.perform(get("/orders/import/template").header(ROLE, "SALES"))
                .andExpect(status().isOk())
                .andExpect(content().string(startsWith("Order#,Order Date,Ship By,Customer Name")))
                .andReturn().getResponse().getContentAsString(StandardCharsets.UTF_8);

        upload("WALMART", template)
                .andExpect(jsonPath("$.created").value(2))
                .andExpect(jsonPath("$.failed").value(0));
    }

    // ---------- helpers ----------

    private ResultActions upload(String channel, String csv) throws Exception {
        return mvc.perform(multipart("/orders/import").file(file(csv)).param("channel", channel)
                .header(ROLE, "SALES"));
    }

    private static MockMultipartFile file(String csv) {
        return new MockMultipartFile("file", "orders.csv", "text/csv", csv.getBytes(StandardCharsets.UTF_8));
    }

    private SalesOrder order(String externalOrderNo) {
        Long id = orderRepository.findAll().stream()
                .filter(o -> externalOrderNo.equals(o.getExternalOrderNo()))
                .findFirst().orElseThrow().getId();
        return orderRepository.findDetailById(id).orElseThrow();
    }

    private Product product(String sku, String name, String price, int stock, boolean active) {
        Product p = new Product();
        p.setSku(sku);
        p.setName(name);
        p.setUnitsPerCarton(12);
        p.setPrice(new BigDecimal(price));
        p.setStockQty(stock);
        p.setMinStock(10);
        p.setActive(active);
        return productRepository.save(p);
    }
}
