import Image from "next/image";
import { Icon } from "@/components/ui";
import { PRODUCT_STATUS_STYLES } from "@/constants";
import type { Product } from "@/interfaces";
import { cn, formatCurrency, getStockStatus } from "@/utils";

export function ProductCard({ product }: { product: Product }) {
  const status = getStockStatus(product);
  const statusStyle = PRODUCT_STATUS_STYLES[status];

  return (
    <div className="group flex flex-col justify-between bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div>
        <div
          className={cn(
            "relative w-full h-48 bg-surface-container-low overflow-hidden",
            status === "out_of_stock" && "opacity-75",
          )}
        >
          <Image
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            src={product.imageUrl}
            alt={product.imageAlt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
          <span className="absolute top-space-sm left-space-sm px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur font-data-mono text-label-sm text-secondary shadow-xs">
            {product.sku}
          </span>
        </div>
        <div className="p-space-lg flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
            {product.brand}
          </span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h2>
          <div className="flex items-center gap-space-xs text-secondary mt-space-xs">
            <Icon name="inventory" className="text-[16px]" />
            <span className="font-body-sm text-body-sm">{product.packDescription}</span>
          </div>
        </div>
      </div>
      <div className="px-space-lg pb-space-lg pt-space-xs flex flex-col gap-space-sm">
        <div className="flex items-baseline justify-between">
          <span className="font-headline-lg text-headline-lg text-on-surface font-semibold">
            {formatCurrency(product.price)}
          </span>
          <span className="font-body-sm text-body-sm text-secondary">/ {product.priceUnit}</span>
        </div>
        <div
          className={cn(
            "inline-flex items-center justify-center h-[22px] px-2.5 rounded-full font-label-sm text-label-sm font-semibold",
            statusStyle.className,
          )}
        >
          {statusStyle.label} ({product.stockOnHand} {product.stockUnit})
        </div>
      </div>
    </div>
  );
}
