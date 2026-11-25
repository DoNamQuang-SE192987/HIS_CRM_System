import type { StockUnit } from "./common.interface";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface Product {
  sku: string;
  name: string;
  brand: string;
  /** Short pack size, e.g. "320ml x 24" */
  packSize: string;
  /** Full pack description shown on the catalogue card */
  packDescription: string;
  price: number;
  priceUnit: "carton" | "bag";
  stockUnit: StockUnit;
  stockOnHand: number;
  minStock: number;
  imageUrl: string;
  imageAlt: string;
}
