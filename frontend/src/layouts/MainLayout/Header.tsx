"use client";

import Image from "next/image";
import { Icon } from "@/components/ui";
import { useAuthStore } from "@/stores";

interface HeaderProps {
  /** Number of low-stock products shown on the notification bell. */
  lowStockCount: number;
}

export function Header({ lowStockCount }: HeaderProps) {
  const currentUser = useAuthStore((state) => state.currentUser);

  return (
    <header className="fixed top-0 left-[260px] right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-margin flex items-center justify-between gap-space-lg">
      {/* Global search */}
      <div className="flex-1 max-w-xl">
        <div className="relative flex items-center">
          <Icon
            name="search"
            className="absolute left-space-md text-secondary text-[20px] pointer-events-none"
          />
          <input
            className="w-full h-10 pl-10 pr-space-md rounded-lg bg-surface-container-low font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-colors"
            placeholder="Search orders, products, SKUs, or POs... [Ctrl+K]"
            type="text"
            aria-label="Global search"
          />
        </div>
      </div>

      <div className="flex items-center gap-space-lg">
        {/* Live status */}
        <div className="flex items-center gap-space-xs px-space-md py-1 rounded-full bg-secondary-container">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-label-sm text-label-sm text-on-secondary-container">
            Fulfillment Live
          </span>
        </div>

        {/* Notifications */}
        <button
          className="relative p-space-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors flex items-center justify-center"
          type="button"
          aria-label="Notifications"
        >
          <Icon name="notifications" className="text-[22px]" />
          {lowStockCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex items-center px-1.5 py-0.5 rounded-full bg-error text-on-error font-label-sm text-[10px] leading-none font-bold"
              title={`${lowStockCount} items low in stock`}
            >
              {lowStockCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        {currentUser?.avatarUrl && (
          <div className="flex items-center gap-space-sm pl-space-sm">
            <Image
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
              src={currentUser.avatarUrl}
              width={32}
              height={32}
            />
          </div>
        )}
      </div>
    </header>
  );
}
