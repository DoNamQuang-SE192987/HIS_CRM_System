import type { Order, OrderDetail, OrderStats } from "@/interfaces";

export const ORDERS_MOCK: Order[] = [
  { id: "SO-2025-0042", reference: "EDI Direct", channel: "wholesale", customer: "Pacific Harvest Foods", customerNote: "Net 30", orderDate: "2025-10-24", total: 3420, status: "new" },
  { id: "SO-2025-0041", reference: "DSV Crossdock", channel: "walmart", customer: "Walmart Dist. Center #402", customerNote: "Bentonville Hub", orderDate: "2025-10-24", total: 8950, status: "shipped" },
  { id: "SO-2025-0040", reference: "FBA Inbound", channel: "amazon", customer: "Amazon Fulfillment MDW2", customerNote: "Joliet Facility", orderDate: "2025-10-23", total: 1280, status: "shipped" },
  { id: "SO-2025-0039", reference: "Standing Weekly", channel: "wholesale", customer: "Golden Gate Asian Market", customerNote: "SF Branch", orderDate: "2025-10-23", total: 5640, status: "new" },
  { id: "SO-2025-0038", reference: "Web Order", channel: "wholesale", customer: "Bay Area Caterers Co.", customerNote: "Oakland Base", orderDate: "2025-10-22", total: 2190, status: "shipped" },
  { id: "SO-2025-0037", reference: "Customer Void", channel: "amazon", customer: "Amazon Prime Pantry Hub", customerNote: "Stockton", orderDate: "2025-10-22", total: 940, status: "canceled" },
  { id: "SO-2025-0036", reference: "LTL Dry Goods", channel: "wholesale", customer: "Sunrise Supermarket Chain", customerNote: "Multi-Store PO", orderDate: "2025-10-21", total: 11400, status: "shipped" },
  { id: "SO-2025-0035", reference: "Refrigerated PO", channel: "wholesale", customer: "Great Wall Gourmet Dist.", customerNote: "Bay Area Route", orderDate: "2025-10-20", total: 4850, status: "shipped" },
];

/** Extra fields of fully-specified orders, keyed by order id. */
export const ORDER_DETAILS_MOCK: Record<string, Omit<OrderDetail, keyof Order>> = {
  "SO-2025-0042": {
    createdAt: "2025-10-24T09:15:00Z",
    channelDescription: "Direct Account Order",
    marketplaceOrderNo: "WMT-982341092",
    account: {
      name: "Pacific Harvest Foods Inc.",
      accountNo: "CUST-8812",
      tier: "Verified Wholesale Tier-1 Client",
    },
    shipTo: {
      name: "Pacific Harvest Distribution Center",
      lines: ["Building 4, Dock 12", "1420 Harbor Blvd", "Oakland, CA 94607"],
    },
    billTo: {
      name: "Pacific Harvest Foods Corp.",
      attention: "Accounts Payable",
      lines: ["200 California Street, Suite 500", "San Francisco, CA 94111"],
    },
    items: [
      { sku: "LNS217", productName: "Organic Mango Puree", packSize: "320ml x 24 cans", quantity: 50, unitPrice: 38 },
      { sku: "LNS104", productName: "Golden Roasted Sesame Oil", packSize: "500ml x 12 bottles", quantity: 30, unitPrice: 34 },
      { sku: "LNS402", productName: "Premium Coconut Milk", packSize: "400ml x 24 cans", quantity: 25, unitPrice: 20 },
    ],
    invoice: {
      invoiceNumber: "INV-2025-0042",
      invoiceDate: "2025-10-24",
      paymentTermDays: 30,
    },
  },
};

export const ORDER_STATS_MOCK: OrderStats = {
  totalVolume: 38670,
  volumeTrendPct: 8.4,
  awaitingDispatch: 14,
  priorityColdChain: 6,
  dispatchedToday: 25,
  exceptions: 3,
};
