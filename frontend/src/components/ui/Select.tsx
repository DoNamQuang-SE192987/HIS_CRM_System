import type { ReactNode, SelectHTMLAttributes } from "react";
import { Icon } from "./Icon";
import { SELECT_CLASS } from "./styles";
import { cn } from "@/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
  wrapperClassName?: string;
}

/** Native select with the app's look and a chevron. */
export function Select({ children, className, wrapperClassName, ...props }: SelectProps) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <select className={cn(SELECT_CLASS, "w-full", className)} {...props}>
        {children}
      </select>
      <Icon
        name="expand_more"
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary text-[18px] pointer-events-none"
      />
    </div>
  );
}
