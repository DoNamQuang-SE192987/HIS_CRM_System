import { Icon } from "@/components/ui";
import { cn } from "@/utils";

interface OrderMetricCardProps {
  label: string;
  value: string;
  hint: string;
  hintIcon: string;
  hintClassName: string;
  icon: string;
  iconClassName: string;
}

export function OrderMetricCard({
  label,
  value,
  hint,
  hintIcon,
  hintClassName,
  icon,
  iconClassName,
}: OrderMetricCardProps) {
  return (
    <div className="bg-surface-container-lowest p-5 rounded-lg shadow-sm flex items-center justify-between">
      <div className="flex flex-col">
        <span className="font-label-md text-label-md text-secondary uppercase tracking-wider">
          {label}
        </span>
        <span className="font-headline-xl text-headline-xl text-on-surface font-bold mt-1">
          {value}
        </span>
        <span
          className={cn(
            "font-label-sm text-label-sm mt-1 flex items-center gap-1 font-medium",
            hintClassName,
          )}
        >
          <Icon name={hintIcon} className="text-[14px]" /> {hint}
        </span>
      </div>
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconClassName)}>
        <Icon name={icon} className="text-[22px]" />
      </div>
    </div>
  );
}
