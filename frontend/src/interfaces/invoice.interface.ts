import type { SalesChannel } from "./order.interface";

export interface InvoiceLine {
  lineNo: number;
  qty: number;
  sku: string;
  description: string;
  packSize: string | null;
  unitPrice: number;
  amount: number;
}

/** Print data of GET /invoices/{id}. */
export interface Invoice {
  id: number;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  paymentTermDays: number;
  /** Order was canceled after the invoice was issued. */
  voided: boolean;
  company: { name: string; address: string; phone: string; email: string };
  orderId: number;
  orderCode: string;
  orderDate: string;
  channel: SalesChannel;
  externalOrderNo: string | null;
  customerName: string;
  recipientName: string;
  shipTo: string;
  billTo: string;
  lines: InvoiceLine[];
  total: number;
  currency: string;
}
