import { Icon } from "@/components/ui";
import { SALES_CHANNEL_STYLES } from "@/constants";
import type { Address, OrderDetail } from "@/interfaces";

function AddressBlock({
  title,
  icon,
  iconClassName,
  address,
}: {
  title: string;
  icon: string;
  iconClassName: string;
  address: Address;
}) {
  return (
    <div className="flex flex-col p-space-lg rounded-xl bg-surface-container-low/40">
      <div className="flex items-center gap-space-sm mb-space-sm">
        <Icon name={icon} className={`text-[20px] ${iconClassName}`} />
        <h3 className="font-headline-sm text-headline-sm text-on-surface">{title}</h3>
      </div>
      <div className="flex flex-col gap-0.5 font-body-md text-body-md text-on-surface pl-7">
        <p className="font-semibold text-on-surface">
          {address.name}
          {address.attention && ` - ${address.attention}`}
        </p>
        {address.lines.map((line) => (
          <p key={line} className="text-on-surface-variant">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

export function OrderInfoCard({ order }: { order: OrderDetail }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden p-space-lg flex flex-col gap-space-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <Icon name="corporate_fare" className="text-primary text-[22px]" />
          <h2 className="font-headline-md text-headline-md text-on-surface">Order Information</h2>
        </div>
        <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
          B2B Wholesale Record
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg">
        <div className="flex flex-col gap-space-xs p-space-md rounded-lg bg-surface-container-low/70">
          <span className="font-label-md text-label-md text-secondary">Sales Channel</span>
          <div className="flex items-center gap-space-sm mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-container" />
            <span className="font-headline-sm text-headline-sm text-on-surface">
              {SALES_CHANNEL_STYLES[order.channel].label}
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-secondary">{order.channelDescription}</span>
        </div>

        <div className="flex flex-col gap-space-xs p-space-md rounded-lg bg-surface-container-low/70">
          <span className="font-label-md text-label-md text-secondary">Marketplace Order #</span>
          <div className="mt-1">
            <span className="font-data-mono text-data-mono text-on-surface font-semibold">
              {order.marketplaceOrderNo ?? "—"}
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-outline">EDI Cross-Reference</span>
        </div>

        <div className="flex flex-col gap-space-xs p-space-md rounded-lg bg-surface-container-low/70 lg:col-span-2">
          <span className="font-label-md text-label-md text-secondary">Customer Account</span>
          <div className="flex flex-wrap items-center justify-between gap-space-xs mt-1">
            <span className="font-headline-sm text-headline-sm text-on-surface">{order.account.name}</span>
            <span className="font-data-mono text-data-mono px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
              Account: {order.account.accountNo}
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-secondary">{order.account.tier}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg pt-space-xs">
        <AddressBlock title="Ship To Address" icon="warehouse" iconClassName="text-primary" address={order.shipTo} />
        <AddressBlock title="Bill To Address" icon="receipt" iconClassName="text-secondary" address={order.billTo} />
      </div>
    </div>
  );
}
