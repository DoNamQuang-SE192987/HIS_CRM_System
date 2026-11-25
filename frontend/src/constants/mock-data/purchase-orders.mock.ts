import type {
  PurchaseOrder,
  PurchaseOrderDraft,
  PurchaseOrderStats,
  Supplier,
} from "@/interfaces";

export const SUPPLIERS_MOCK: Supplier[] = [
  { id: "sup-01", name: "Global Thai Imports Ltd", description: "Bangkok Hub" },
  { id: "sup-02", name: "Saigon Valley Harvest Co", description: "Direct Producer" },
  { id: "sup-03", name: "Siam Coconut Grove Co", description: "Contract Supplier" },
  { id: "sup-04", name: "Sunrise Milling Corp", description: "Flour & Grains" },
  { id: "sup-05", name: "Golden Dragon Condiments", description: "Specialty Sauces" },
];

export const PURCHASE_ORDERS_MOCK: PurchaseOrder[] = [
  { id: "PO-2025-0014", supplierId: "sup-01", orderDate: "2025-10-24", status: "draft", total: 4200 },
  { id: "PO-2025-0013", supplierId: "sup-02", orderDate: "2025-10-23", status: "ordered", total: 6850 },
  { id: "PO-2025-0012", supplierId: "sup-03", orderDate: "2025-10-21", status: "received", total: 3000 },
  { id: "PO-2025-0011", supplierId: "sup-04", orderDate: "2025-10-19", status: "received", total: 5400 },
  { id: "PO-2025-0010", supplierId: "sup-05", orderDate: "2025-10-15", status: "received", total: 2780 },
];

export const PURCHASE_ORDER_DRAFT_MOCK: PurchaseOrderDraft = {
  id: "PO-2025-0015",
  supplierId: "sup-01",
  expectedDeliveryDate: "2025-10-30",
  receivingSurcharge: 0,
  lines: [
    { sku: "LNS217", productName: "Organic Mango Puree", quantity: 60, unitCost: 28 },
    { sku: "LNS104", productName: "Golden Roasted Sesame Oil", quantity: 50, unitCost: 24 },
  ],
};

export const PURCHASE_ORDER_STATS_MOCK: PurchaseOrderStats = {
  awaitingInbound: 5,
  monthlyRestock: 22230,
};
