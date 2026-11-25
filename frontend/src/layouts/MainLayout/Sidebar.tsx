"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui";
import { APP_LOGO_URL, APP_NAME, APP_TAGLINE, ROLE_LABELS, SIDEBAR_NAV_ITEMS, can } from "@/constants";
import { useAuthStore } from "@/stores";
import { cn } from "@/utils";

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.role);
  const hydrated = useAuthStore((state) => state.hydrated);
  // Before the saved role is known, show every item (avoids a flash of the wrong menu).
  const items = hydrated ? SIDEBAR_NAV_ITEMS.filter((item) => can(role, item.permission)) : SIDEBAR_NAV_ITEMS;

  return (
    <aside className="print:hidden fixed left-0 top-0 h-full w-[260px] bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between">
      <div className="flex flex-col">
        {/* Brand */}
        <div className="h-16 px-space-lg flex items-center gap-space-sm bg-surface-container-lowest">
          <Image
            alt={`${APP_NAME} Logo`}
            className="h-8 w-auto object-contain"
            src={APP_LOGO_URL}
            width={32}
            height={32}
            priority
          />
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface leading-tight">{APP_NAME}</span>
            <span className="font-label-sm text-label-sm text-secondary tracking-wider uppercase">{APP_TAGLINE}</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="px-space-md py-space-md">
          <nav className="flex flex-col gap-space-xs">
            {items.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-space-md px-space-md py-space-sm rounded-lg transition-colors",
                    active
                      ? "bg-primary-container text-on-primary font-label-md"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
                  )}
                >
                  <Icon name={item.icon} className="text-[20px]" />
                  <span className="font-body-md text-body-md">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Current role */}
      <div className="p-space-md m-space-md rounded-lg bg-surface-container-low flex items-center gap-space-sm">
        <div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-label-sm text-label-sm font-bold flex-shrink-0">
          {hydrated ? ROLE_LABELS[role].initials : "…"}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
            {hydrated ? `${ROLE_LABELS[role].label} staff` : "Loading role"}
          </span>
          <span className="font-label-sm text-label-sm text-secondary truncate">
            {hydrated ? ROLE_LABELS[role].description : ""}
          </span>
        </div>
      </div>
    </aside>
  );
}
