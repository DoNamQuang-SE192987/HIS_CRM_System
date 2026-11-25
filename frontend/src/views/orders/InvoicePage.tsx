import { InvoiceDocument } from "@/components/invoice/InvoiceDocument";
import { InvoiceToolbar } from "@/components/invoice/InvoiceToolbar";
import type { InvoiceInfo, OrderDetail } from "@/interfaces";

interface InvoicePageProps {
  order: OrderDetail;
  invoice: InvoiceInfo;
}

export function InvoicePage({ order, invoice }: InvoicePageProps) {
  return (
    <>
      <InvoiceToolbar orderId={order.id} />
      <InvoiceDocument order={order} invoice={invoice} />
    </>
  );
}
