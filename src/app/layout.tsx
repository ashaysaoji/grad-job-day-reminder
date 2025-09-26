// 

import "./globals.css";
import type { Metadata } from "next";
import Providers from "./providers";

export const metadata: Metadata = { title: "Grad Reminder" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-gradient-to-b from-white to-gray-50 text-gray-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
