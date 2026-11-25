import type { Metadata } from "next";
import { inventoryService, productService } from "@/services";
import { InventoryPage } from "@/views/inventory/InventoryPage";

export const metadata: Metadata = { title: "Inventory" };

export default async function Page() {
  const [products, movements] = await Promise.all([
    productService.getProducts(),
    inventoryService.getStockMovements(),
  ]);

  return <InventoryPage products={products} movements={movements} />;
}
