import { Icon } from "@/components/ui";

interface FulfillmentCutoffBannerProps {
  cutoffTime: string;
  remaining: string;
}

export function FulfillmentCutoffBanner({ cutoffTime, remaining }: FulfillmentCutoffBannerProps) {
  return (
    <div className="p-4 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
      <div className="flex items-center gap-space-md">
        <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
          <Icon name="inventory" className="text-[22px]" />
        </div>
        <div className="flex flex-col">
          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Warehouse Fulfillment Cut-off
          </span>
          <span className="font-body-sm text-body-sm text-secondary">
            Today&apos;s dry &amp; ambient freight dispatch closes at {cutoffTime} ({remaining}{" "}
            remaining).
          </span>
        </div>
      </div>
      <div className="flex items-center gap-space-sm self-end sm:self-auto">
        <button
          className="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors"
          type="button"
        >
          Print Pick Slips
        </button>
        <button
          className="px-space-md py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-medium hover:bg-primary transition-colors"
          type="button"
        >
          Batch Ship Orders
        </button>
      </div>
    </div>
  );
}
