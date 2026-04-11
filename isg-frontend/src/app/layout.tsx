import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

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
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-grow ml-64 p-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
