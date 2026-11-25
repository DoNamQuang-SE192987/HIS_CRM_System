import { PRODUCTS_MOCK } from "@/constants/mock-data";
import type { Product } from "@/interfaces";
import { getStockStatus } from "@/utils";

/**
 * Product catalogue data access.
 * Backed by mock data for now — swap the bodies for real API calls later.
 */
export const productService = {
  async getProducts(): Promise<Product[]> {
    return PRODUCTS_MOCK;
  },

  async getLowStockProducts(): Promise<Product[]> {
    return PRODUCTS_MOCK.filter((product) => getStockStatus(product) === "low_stock");
  },
};
