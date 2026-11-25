import type { ReactNode } from "react";

interface PrintLayoutProps {
  children: ReactNode;
}

/** Chrome-less layout for printable documents (invoices, pick slips…). */
export function PrintLayout({ children }: PrintLayoutProps) {
  return (
    <main className="w-full min-h-screen bg-surface">
      <div className="flex flex-col w-full">{children}</div>
    </main>
  );
}
