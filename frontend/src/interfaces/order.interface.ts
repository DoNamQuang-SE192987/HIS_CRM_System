import type { Customer } from "./customer.interface";

export type SalesChannel = "WHOLESALE" | "WALMART" | "AMAZON";
export type OrderStatus = "NEW" | "SHIPPED" | "CANCELED";

export interface OrderSummary {
  id: number;
  code: string;
  channel: SalesChannel;
  externalOrderNo: string | null;
  customerId: number;
  customerName: string;
  recipientName: string;
  orderDate: string;
  shipBy: string | null;
  total: number;
  status: OrderStatus;
  overdue: boolean;
}

export interface OrderItem {
  id: number;
  productId: number;
  sku: string;
  productName: string;
  packSize: string | null;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  availableStock: number;
  enoughStock: boolean;
}

export interface InvoiceSummary {
  id: number;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  paymentTermDays: number;
}

export interface OrderDetail {
  id: number;
  code: string;
  channel: SalesChannel;
  externalOrderNo: string | null;
  customer: Customer;
  recipientName: string;
  shipTo: string;
  billTo: string | null;
  orderDate: string;
  shipBy: string | null;
  status: OrderStatus;
  overdue: boolean;
  canShip: boolean;
  total: number;
  note: string | null;
  items: OrderItem[];
  invoice: InvoiceSummary | null;
  createdAt: string;
  shippedAt: string | null;
  canceledAt: string | null;
}

export interface OrderQuery {
  status?: OrderStatus;
  channel?: SalesChannel;
  q?: string;
  page?: number;
  size?: number;
}

export interface OrderCreatePayload {
  channel: SalesChannel;
  externalOrderNo?: string;
  customerId?: number;
  recipientName?: string;
  shipTo?: string;
  billTo?: string;
  shipBy?: string;
  note?: string;
  items: { productId: number; qty: number }[];
}

export type ImportResultStatus = "CREATED" | "SKIPPED" | "FAILED";

export interface OrderImportResult {
  channel: SalesChannel;
  totalOrders: number;
  created: number;
  skipped: number;
  failed: number;
  results: {
    externalOrderNo: string | null;
    lines: number[];
    status: ImportResultStatus;
    orderId?: number;
    orderCode?: string;
    message?: string;
  }[];
}
