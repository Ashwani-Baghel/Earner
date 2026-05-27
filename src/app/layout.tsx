import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { NotificationProvider } from "@/context/NotificationContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Fiverr Clone – Find the perfect freelance service",
  description:
    "Find, hire, and work with top freelancers. Fiverr clone built with Next.js 16, Firebase, and Tailwind CSS. Graphic design, web development, video, writing, and more.",
  keywords: "freelance, fiverr clone, design, development, marketing, nextjs",
  openGraph: {
    title: "Fiverr Clone",
    description: "Find the perfect freelance service, right away.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-white">
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <ConditionalLayout>{children}</ConditionalLayout>
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
