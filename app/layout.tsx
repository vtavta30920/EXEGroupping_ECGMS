// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { ApiProvider } from "./providers/ApiProviders"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ECGMS - Course Grouping Management",
  description: "Hệ thống quản lý phân nhóm môn học EXE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light" // "system" | "light" | "dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* ✅ Bọc ApiProvider ở ngoài cùng */}
          <ApiProvider>
            {children}
          </ApiProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}