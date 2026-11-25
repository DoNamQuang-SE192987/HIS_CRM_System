import type { ReactNode } from "react";
import { Icon } from "@/components/ui";
import { cn } from "@/utils";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  icon: string;
  /** Colour classes for the icon tile */
  iconClassName?: string;
  valueClassName?: string;
  footer?: ReactNode;
}

export function KpiCard({
  label,
  value,
  icon,
  iconClassName = "bg-surface-container text-primary",
  valueClassName = "text-on-surface",
  footer,
}: KpiCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className="font-label-md text-label-md text-secondary uppercase tracking-wider">
          {label}
        </span>
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", iconClassName)}>
          <Icon name={icon} className="text-[20px]" />
        </div>
      </div>
      <div className="my-3">
        <span
          className={cn(
            "font-headline-xl text-headline-xl tracking-tight font-semibold",
            valueClassName,
          )}
        >
          {value}
        </span>
      </div>
      {footer}
    </div>
  );
}
