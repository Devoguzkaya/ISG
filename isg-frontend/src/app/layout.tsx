import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Shell from "@/components/Shell";

import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ISG Takip Sistemi | Öz Çeliker Elektrik",
  description: "İş Güvenliği Uzmanı Takip ve Kontrol Paneli",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-[var(--background)]`}>
        <ThemeProvider>
          <Shell>
            {children}
          </Shell>
        </ThemeProvider>
      </body>
    </html>
  );
}
