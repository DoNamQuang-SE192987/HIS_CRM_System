import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { orderService } from "@/services";
import { OrderDetailPage } from "@/views/orders/OrderDetailPage";

export async function generateStaticParams() {
  const ids = await orderService.getOrderIdsWithDetail();
  return ids.map((orderId) => ({ orderId }));
}

export async function generateMetadata({ params }: PageProps<"/orders/[orderId]">): Promise<Metadata> {
  const { orderId } = await params;
  return { title: `Order ${orderId}` };
}

export default async function Page({ params }: PageProps<"/orders/[orderId]">) {
  const { orderId } = await params;
  const order = await orderService.getOrderById(orderId);
  if (!order) notFound();

  return <OrderDetailPage order={order} />;
}
