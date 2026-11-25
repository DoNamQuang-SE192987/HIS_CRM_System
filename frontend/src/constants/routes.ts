export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  orders: "/orders",
  orderDetail: (orderId: string) => `/orders/${orderId}`,
  orderInvoice: (orderId: string) => `/orders/${orderId}/invoice`,
  products: "/products",
  inventory: "/inventory",
  purchaseOrders: "/purchase-orders",
} as const;
