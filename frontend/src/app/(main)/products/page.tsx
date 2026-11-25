import type { Metadata } from "next";
import { productService } from "@/services";
import { ProductsCataloguePage } from "@/views/products/ProductsCataloguePage";

export const metadata: Metadata = { title: "Products" };

export default async function Page() {
  const products = await productService.getProducts();

  return <ProductsCataloguePage products={products} />;
}
