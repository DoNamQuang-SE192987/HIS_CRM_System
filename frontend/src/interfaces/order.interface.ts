import type { Address } from "./common.interface";

export type SalesChannel = "wholesale" | "walmart" | "amazon";
export type ChannelGroup = "wholesale" | "ecommerce";
export type OrderStatus = "new" | "shipped" | "canceled";

export interface Order {
  id: string;
  /** Order source / reference note, e.g. "EDI Direct" */
  reference: string;
  channel: SalesChannel;
  customer: string;
  customerNote: string;
  orderDate: string;
  total: number;
  status: OrderStatus;
}

export interface OrderLineItem {
  sku: string;
  productName: string;
  packSize: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceInfo {
  invoiceNumber: string;
  invoiceDate: string;
  paymentTermDays: number;
}

export interface OrderDetail extends Order {
  createdAt: string;
  channelDescription: string;
  marketplaceOrderNo?: string;
  account: {
    name: string;
    accountNo: string;
    tier: string;
  };
  shipTo: Address;
  billTo: Address;
  items: OrderLineItem[];
  invoice?: InvoiceInfo;
}

export interface OrderStats {
  totalVolume: number;
  volumeTrendPct: number;
  awaitingDispatch: number;
  priorityColdChain: number;
  dispatchedToday: number;
  exceptions: number;
}
