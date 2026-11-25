export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  orders: "/orders",
  orderNew: "/orders/new",
  orderDetail: (orderId: number | string) => `/orders/${orderId}`,
  invoice: (invoiceId: number | string) => `/invoices/${invoiceId}`,
  products: "/products",
  inventory: "/inventory",
  purchaseOrders: "/purchase-orders",
  purchaseOrderDetail: (id: number | string) => `/purchase-orders/${id}`,
  /** New PO, optionally pre-filled with products (e.g. from the low-stock list). */
  purchaseOrderNew: (productIds: number[] = []) =>
    productIds.length > 0 ? `/purchase-orders/new?productIds=${productIds.join(",")}` : "/purchase-orders/new",
} as const;
