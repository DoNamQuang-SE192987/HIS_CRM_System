import type { ReactNode } from "react";
import { productService } from "@/services";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Application shell shared by every back-office screen:
 * fixed sidebar (260px) + fixed top header + scrollable content area.
 */
export async function MainLayout({ children }: MainLayoutProps) {
  const lowStockProducts = await productService.getLowStockProducts();

  return (
    <>
      <Sidebar />
      <div className="pl-[260px]">
        <Header lowStockCount={lowStockProducts.length} />
        <main className="w-full pt-16 bg-surface min-h-screen">
          <div className="flex flex-col w-full">{children}</div>
        </main>
      </div>
    </>
  );
}
