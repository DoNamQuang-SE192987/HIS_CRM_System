import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { APP_NAME } from "@/constants";
import "@/styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: "Wholesale food order management system",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/*
          Material Symbols icon font (ligature based, rendered via <Icon />).
          Loaded in the root layout so it applies to every route; `display=block`
          is intentional to avoid flashing raw ligature names like "grid_view".
        */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font, @next/next/google-font-display */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="bg-surface font-body-md text-on-surface antialiased">{children}</body>
    </html>
  );
}
