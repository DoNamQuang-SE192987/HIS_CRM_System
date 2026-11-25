import { Icon } from "@/components/ui";
import { cn } from "@/utils";

interface InventoryStatCardProps {
  label: string;
  value: number;
  valueClassName?: string;
  hint: string;
  hintClassName: string;
  icon: string;
  iconClassName: string;
}

export function InventoryStatCard({
  label,
  value,
  valueClassName = "text-on-surface",
  hint,
  hintClassName,
  icon,
  iconClassName,
}: InventoryStatCardProps) {
  return (
    <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center justify-between">
      <div className="flex flex-col">
        <span className="font-label-md text-label-md text-secondary">{label}</span>
        <span className={cn("font-headline-lg text-headline-lg mt-0.5", valueClassName)}>{value}</span>
        <span className={cn("font-label-sm text-label-sm mt-1 font-semibold", hintClassName)}>{hint}</span>
      </div>
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconClassName)}>
        <Icon name={icon} className="text-[20px]" />
      </div>
    </div>
  );
}
