import type { Permission } from "@/constants/permissions";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  /** Hidden from the sidebar when the current role lacks this permission. */
  permission: Permission;
}
