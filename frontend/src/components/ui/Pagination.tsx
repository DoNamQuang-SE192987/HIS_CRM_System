import { cn } from "@/utils";
import { Icon } from "./Icon";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Page numbers with ellipsis: 1 2 3 … 6 */
function getPageItems(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3].forEach((p) => pages.add(p));

  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const items: (number | "ellipsis")[] = [];
  sorted.forEach((p, index) => {
    if (index > 0 && p - sorted[index - 1] > 1) items.push("ellipsis");
    items.push(p);
  });
  return items;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  return (
    <div className="flex items-center gap-space-xs">
      <button
        className="inline-flex items-center gap-1 px-3 h-[32px] rounded-lg bg-surface-container-low text-secondary hover:text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors disabled:opacity-40 disabled:pointer-events-none"
        disabled={isFirst}
        type="button"
        onClick={() => onPageChange(page - 1)}
      >
        <Icon name="chevron_left" className="text-[16px]" />
        <span>Previous</span>
      </button>
      <div className="flex items-center gap-1">
        {getPageItems(page, totalPages).map((item, index) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-1 text-secondary text-label-sm">
              ...
            </span>
          ) : (
            <button
              key={item}
              className={cn(
                "w-8 h-8 rounded-lg font-label-md text-label-md",
                item === page
                  ? "bg-primary text-on-primary font-semibold"
                  : "text-secondary hover:text-on-surface hover:bg-surface-container-low",
              )}
              type="button"
              aria-current={item === page ? "page" : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ),
        )}
      </div>
      <button
        className="inline-flex items-center gap-1 px-3 h-[32px] rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container-high font-label-md text-label-md transition-colors disabled:opacity-40 disabled:pointer-events-none"
        disabled={isLast}
        type="button"
        onClick={() => onPageChange(page + 1)}
      >
        <span>Next</span>
        <Icon name="chevron_right" className="text-[16px]" />
      </button>
    </div>
  );
}
