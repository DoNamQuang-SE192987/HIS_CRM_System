import { Icon } from "@/components/ui";
import { SALES_CHANNEL_STYLES } from "@/constants";
import type { SalesChannel } from "@/interfaces";
import { cn } from "@/utils";

interface ChannelBadgeProps {
  channel: SalesChannel;
  /** "compact" = plain label chip used in dense dashboard tables */
  variant?: "default" | "compact";
}

export function ChannelBadge({ channel, variant = "default" }: ChannelBadgeProps) {
  const style = SALES_CHANNEL_STYLES[channel];

  if (variant === "compact") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm font-medium">
        {style.label}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-label-md text-label-md",
        style.className,
      )}
    >
      <Icon name={style.icon} className={cn("text-[15px]", style.iconClassName)} />
      {style.label}
    </span>
  );
}
