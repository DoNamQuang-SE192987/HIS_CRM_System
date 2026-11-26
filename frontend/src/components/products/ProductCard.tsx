import { StockStatusBadge } from "@/components/common";
import { Icon } from "@/components/ui";
import type { Product } from "@/interfaces";
import { cn, formatCurrency } from "@/utils";

interface ProductCardProps {
  product: Product;
  /** Manager-only actions; omitted for other roles. */
  onEdit?: () => void;
  onToggle?: () => void;
  toggling?: boolean;
}

export function ProductCard({ product, onEdit, onToggle, toggling }: ProductCardProps) {
  const unit = product.priceUnit === "BAG" ? "bag" : "carton";

  return (
    <div
      className={cn(
        "group flex flex-col justify-between bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden",
        !product.active && "opacity-70",
      )}
    >
      <div>
        <div className="relative w-full h-44 bg-surface-container-low overflow-hidden flex items-center justify-center">
          {product.imageUrl ? (
            // Arbitrary supplier image hosts - plain <img> instead of next/image (no remotePatterns needed).
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              src={product.imageUrl}
              alt={product.name}
            />
          ) : (
            <Icon name="inventory_2" className="text-[48px] text-outline-variant" />
          )}
          <span className="absolute top-space-sm left-space-sm px-2 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur font-data-mono text-label-sm text-secondary shadow-xs">
            {product.sku}
          </span>
          {!product.active && (
            <span className="absolute top-space-sm right-space-sm px-2 py-0.5 rounded bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm">
              Discontinued
            </span>
          )}
        </div>
        <div className="p-space-lg flex flex-col gap-space-xs">
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
            {product.brand ?? "—"}
          </span>
          <h2
            className="font-headline-sm text-headline-sm text-on-surface line-clamp-2 group-hover:text-primary transition-colors"
            title={product.name}
          >
            {product.name}
          </h2>
          <div className="flex items-center gap-space-xs text-secondary mt-space-xs">
            <Icon name="inventory" className="text-[16px]" />
            <span className="font-body-sm text-body-sm">
              {product.packDescription ?? product.packSize ?? "—"} · {product.unitsPerCarton} units/carton
            </span>
          </div>
        </div>
      </div>
      <div className="px-space-lg pb-space-lg pt-space-xs flex flex-col gap-space-sm">
        <div className="flex items-baseline justify-between">
          <span className="font-headline-lg text-headline-lg text-on-surface font-semibold">
            {formatCurrency(product.price)}
          </span>
          <span className="font-body-sm text-body-sm text-secondary">/ {unit}</span>
        </div>
        <div className="flex items-center justify-between gap-space-sm">
          <StockStatusBadge status={product.stockStatus}>
            {product.stockQty} {unit}s · min {product.minStock}
          </StockStatusBadge>
          {(onEdit || onToggle) && (
            <div className="flex items-center gap-1">
              {onEdit && (
                <button
                  className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-container-high"
                  type="button"
                  title="Edit product"
                  onClick={onEdit}
                >
                  <Icon name="edit" className="text-[18px]" />
                </button>
              )}
              {onToggle && (
                <button
                  className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-surface-container-high disabled:opacity-50"
                  type="button"
                  title={product.active ? "Discontinue (hide from new orders)" : "Resume selling"}
                  disabled={toggling}
                  onClick={onToggle}
                >
                  <Icon name={product.active ? "toggle_on" : "toggle_off"} className="text-[22px]" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
