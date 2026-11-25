import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { orderService } from "@/services";
import { InvoicePage } from "@/views/orders/InvoicePage";

export async function generateStaticParams() {
  const ids = await orderService.getOrderIdsWithDetail();
  return ids.map((orderId) => ({ orderId }));
}

export async function generateMetadata({ params }: PageProps<"/orders/[orderId]/invoice">): Promise<Metadata> {
  const { orderId } = await params;
  return { title: `Invoice · ${orderId}` };
}

export default async function Page({ params }: PageProps<"/orders/[orderId]/invoice">) {
  const { orderId } = await params;
  const order = await orderService.getOrderById(orderId);
  if (!order?.invoice) notFound();

  return <InvoicePage order={order} invoice={order.invoice} />;
}
