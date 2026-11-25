import type { ReactNode } from "react";
import { cn } from "@/utils";

interface BadgeProps {
  children: ReactNode;
  className?: string;
}

/** Rounded status pill. Pass colour classes via `className`. */
export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold",
        className,
      )}
    >
      {children}
    </span>
  );
}
