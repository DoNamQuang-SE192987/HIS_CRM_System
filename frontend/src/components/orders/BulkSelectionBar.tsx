interface BulkSelectionBarProps {
  selectedCount: number;
}

export function BulkSelectionBar({ selectedCount }: BulkSelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="p-space-md rounded-xl bg-inverse-surface text-inverse-on-surface shadow-md flex items-center justify-between gap-space-md animate-fade-in">
      <div className="flex items-center gap-space-md">
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary font-label-md text-on-primary font-bold">
          {selectedCount}
        </span>
        <span className="font-body-md text-body-md font-medium">
          Orders selected for batch operations
        </span>
      </div>
      <div className="flex items-center gap-space-sm">
        <button
          className="px-3 h-[32px] rounded-lg bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 font-label-md text-label-md text-inverse-on-surface transition-colors"
          type="button"
        >
          Print Pick Lists
        </button>
        <button
          className="px-3 h-[32px] rounded-lg bg-surface-container-lowest/10 hover:bg-surface-container-lowest/20 font-label-md text-label-md text-inverse-on-surface transition-colors"
          type="button"
        >
          Generate Invoices
        </button>
        <button
          className="px-3 h-[32px] rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-colors"
          type="button"
        >
          Mark as Shipped
        </button>
      </div>
    </div>
  );
}
