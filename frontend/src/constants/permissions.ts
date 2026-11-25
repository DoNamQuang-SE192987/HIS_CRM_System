import type { Role } from "@/interfaces/common.interface";

export const ROLES: Role[] = ["SALES", "WAREHOUSE", "MANAGER"];

export const ROLE_LABELS: Record<Role, { label: string; initials: string; description: string }> = {
  SALES: { label: "Sales", initials: "SA", description: "Orders, customers, invoices" },
  WAREHOUSE: { label: "Warehouse", initials: "WH", description: "Shipping, stock, purchase orders" },
  MANAGER: { label: "Manager", initials: "MG", description: "Dashboard, product catalogue" },
};

/**
 * Mirror of the backend @RequireRole rules - used only to hide buttons / menu items.
 * The backend is the real gate (403), so a mismatch here can never grant access.
 */
export const PERMISSIONS = {
  viewDashboard: ["MANAGER"],
  viewProducts: ["SALES", "WAREHOUSE", "MANAGER"],
  manageProducts: ["MANAGER"],
  viewOrders: ["SALES", "WAREHOUSE", "MANAGER"],
  createOrder: ["SALES"],
  importOrders: ["SALES"],
  cancelOrder: ["SALES"],
  shipOrder: ["WAREHOUSE"],
  issueInvoice: ["SALES"],
  viewInvoice: ["SALES", "MANAGER"],
  manageCustomers: ["SALES", "MANAGER"],
  viewInventory: ["WAREHOUSE", "MANAGER"],
  adjustStock: ["WAREHOUSE"],
  viewPurchaseOrders: ["WAREHOUSE", "MANAGER"],
  managePurchaseOrders: ["WAREHOUSE"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

/** Roles allowed to do something - for "switch to X to do this" hints. */
export function rolesFor(permission: Permission): string {
  return PERMISSIONS[permission].map((role) => ROLE_LABELS[role].label).join(" / ");
}
