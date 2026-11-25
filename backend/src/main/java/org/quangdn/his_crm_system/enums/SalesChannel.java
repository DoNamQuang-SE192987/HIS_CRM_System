package org.quangdn.his_crm_system.enums;

/** Where the order comes from. Marketplace channels always carry the marketplace's own order number. */
public enum SalesChannel {
    /** Bán sỉ theo invoice */
    WHOLESALE,
    WALMART,
    AMAZON;

    public boolean isMarketplace() {
        return this != WHOLESALE;
    }
}
