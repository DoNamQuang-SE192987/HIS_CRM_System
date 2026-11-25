import { Badge } from "@/components/ui";
import { ORDER_STATUS_STYLES } from "@/constants";
import type { OrderStatus } from "@/interfaces";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const style = ORDER_STATUS_STYLES[status];
  return <Badge className={style.className}>{style.label}</Badge>;
}
