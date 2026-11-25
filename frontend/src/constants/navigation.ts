import type { NavItem } from "@/interfaces";
import { ROUTES } from "./routes";

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: ROUTES.dashboard, icon: "grid_view" },
  { label: "Orders", href: ROUTES.orders, icon: "shopping_bag" },
  { label: "Products", href: ROUTES.products, icon: "package_2" },
  { label: "Inventory", href: ROUTES.inventory, icon: "inventory_2" },
  { label: "Purchase Orders", href: ROUTES.purchaseOrders, icon: "local_shipping" },
];
