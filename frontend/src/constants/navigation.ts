import type { NavItem } from "@/interfaces";
import { ROUTES } from "./routes";

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: ROUTES.dashboard, icon: "grid_view", permission: "viewDashboard" },
  { label: "Orders", href: ROUTES.orders, icon: "shopping_bag", permission: "viewOrders" },
  { label: "Products", href: ROUTES.products, icon: "package_2", permission: "viewProducts" },
  { label: "Inventory", href: ROUTES.inventory, icon: "inventory_2", permission: "viewInventory" },
  { label: "Purchase Orders", href: ROUTES.purchaseOrders, icon: "local_shipping", permission: "viewPurchaseOrders" },
];
