import type { Metadata } from "next";
import { InventoryPage } from "@/views/inventory/InventoryPage";

export const metadata: Metadata = { title: "Inventory" };

export default function Page() {
  return <InventoryPage />;
}
