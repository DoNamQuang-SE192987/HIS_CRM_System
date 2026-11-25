import { cn } from "@/utils";

interface IconProps {
  /** Material Symbols ligature name, e.g. "grid_view" */
  name: string;
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  return (
    <span className={cn("material-symbols-outlined", className)} aria-hidden="true">
      {name}
    </span>
  );
}
