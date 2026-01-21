import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FIRE + Liquidity Dashboard",
  description: "Model year-by-year FIRE scenarios and liquidity."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
