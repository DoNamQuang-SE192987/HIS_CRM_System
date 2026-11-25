import type { Metadata } from "next";
import { ProductsCataloguePage } from "@/views/products/ProductsCataloguePage";

export const metadata: Metadata = { title: "Products" };

export default function Page() {
  return <ProductsCataloguePage />;
}
