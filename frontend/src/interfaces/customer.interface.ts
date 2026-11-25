import type { SalesChannel } from "./order.interface";

export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  paymentTermDays: number;
  /** Set only on the shared marketplace accounts ("Walmart Marketplace"). */
  marketplaceChannel: SalesChannel | null;
}

export interface CustomerPayload {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  paymentTermDays?: number;
}
