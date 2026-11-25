import { Suspense, type ReactNode } from "react";
import { Toaster } from "@/components/common";
import { Header } from "./Header";
import { RoleHydrator } from "./RoleHydrator";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Application shell shared by every back-office screen:
 * fixed sidebar (260px) + fixed top header + scrollable content area.
 * Sidebar and header are hidden when printing (invoices).
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <>
      <RoleHydrator />
      {/* usePathname() is request data on dynamic routes (/orders/[id]) -> Suspense, with an empty frame as fallback */}
      <Suspense
        fallback={<aside className="print:hidden fixed left-0 top-0 h-full w-[260px] bg-surface-container-lowest z-50" />}
      >
        <Sidebar />
      </Suspense>
      <div className="pl-[260px] print:pl-0">
        <Header />
        <main className="w-full pt-16 print:pt-0 bg-surface print:bg-white min-h-screen">
          <div className="flex flex-col w-full">{children}</div>
        </main>
      </div>
      <Toaster />
    </>
  );
}
