export type StockStatus = "IN_STOCK" | "LOW" | "OUT";
export type PriceUnit = "CARTON" | "BAG";

export interface Product {
  id: number;
  sku: string;
  name: string;
  brand: string | null;
  packSize: string | null;
  packDescription: string | null;
  unitsPerCarton: number;
  price: number;
  priceUnit: PriceUnit;
  stockQty: number;
  minStock: number;
  stockStatus: StockStatus;
  imageUrl: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQuery {
  q?: string;
  brand?: string;
  stockStatus?: StockStatus;
  active?: boolean;
  page?: number;
  size?: number;
}

/** Body of POST /products. `stockQty` = opening balance (create only). */
export interface ProductPayload {
  sku: string;
  name: string;
  brand?: string;
  packSize?: string;
  packDescription?: string;
  unitsPerCarton: number;
  price: number;
  priceUnit: PriceUnit;
  minStock: number;
  imageUrl?: string;
  stockQty?: number;
}
