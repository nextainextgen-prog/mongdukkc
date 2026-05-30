import type { Metadata } from "next";
import { Sarabun, Mali } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const mali = Mali({
  variable: "--font-mali",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "มองดึก KC — Admin",
  description: "ระบบจัดการหลังบ้านร้านมองดึก KC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${sarabun.variable} ${mali.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            classNames: {
              toast: "rounded-2xl border border-border shadow-lg",
            },
          }}
        />
      </body>
    </html>
  );
}
