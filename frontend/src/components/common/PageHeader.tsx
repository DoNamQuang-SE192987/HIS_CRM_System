import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
      <div className="flex flex-col gap-space-xs min-w-0">
        {eyebrow && (
          <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">
            {eyebrow}
          </span>
        )}
        <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">{title}</h1>
        {subtitle && <div className="font-body-md text-body-md text-secondary">{subtitle}</div>}
      </div>
      {actions && <div className="flex items-center flex-wrap gap-space-sm">{actions}</div>}
    </div>
  );
}
