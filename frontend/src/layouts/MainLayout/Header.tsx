"use client";

import { Icon } from "@/components/ui";
import { ROLE_LABELS, ROLES } from "@/constants";
import type { Role } from "@/interfaces";
import { useAuthStore } from "@/stores";
import { cn } from "@/utils";

export function Header() {
  const role = useAuthStore((state) => state.role);
  const hydrated = useAuthStore((state) => state.hydrated);
  const setRole = useAuthStore((state) => state.setRole);

  return (
    <header className="print:hidden fixed top-0 left-[260px] right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-margin flex items-center justify-end gap-space-lg">
      {/* Role switcher: stand-in for login during UAT - every API call sends this role. */}
      <div className="flex items-center gap-space-sm">
        <span className="font-label-sm text-label-sm text-secondary hidden md:inline">Acting as</span>
        <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-lg" role="radiogroup" aria-label="Role">
          {ROLES.map((value: Role) => {
            const active = hydrated && role === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={active}
                title={ROLE_LABELS[value].description}
                className={cn(
                  "px-3 py-1.5 rounded-md font-label-md text-label-md transition-all",
                  active ? "bg-primary-container text-on-primary shadow-sm" : "text-secondary hover:text-on-surface",
                )}
                onClick={() => setRole(value)}
              >
                {ROLE_LABELS[value].label}
              </button>
            );
          })}
        </div>
        <div className="w-8 h-8 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-label-sm text-label-sm font-bold">
          {hydrated ? ROLE_LABELS[role].initials : <Icon name="person" className="text-[18px]" />}
        </div>
      </div>
    </header>
  );
}
