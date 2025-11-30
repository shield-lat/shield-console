import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GlobalFiltersProvider } from "@/lib/hooks/useGlobalFilters";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shield Console | Fintech AI Safety Gateway",
  description: "Control plane and monitoring UI for Shield – the AI Safety Gateway for financial services",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GlobalFiltersProvider>{children}</GlobalFiltersProvider>
      </body>
    </html>
  );
}
