import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { ChatProvider } from "@/context/ChatContext";
import { CmsProvider } from "@/context/CmsContext";
import { getCmsConfig, getCmsCategories } from "@/lib/cms-server";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Earner – Find the perfect freelance service",
  description:
    "Find, hire, and work with top freelancers. Earner built with Next.js 16, Firebase, and Tailwind CSS. Graphic design, web development, video, writing, and more.",
  keywords: "freelance, Earner, design, development, marketing, nextjs",
  openGraph: {
    title: "Earner",
    description: "Find the perfect freelance service, right away.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { header, hero, footer } = await getCmsConfig();
  const categories = await getCmsCategories();
  
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col bg-white overflow-x-hidden w-full max-w-[100vw]">
        <CmsProvider initialData={{ header, hero, footer, categories }}>
          <AuthProvider>
            <NotificationProvider>
              <FavoritesProvider>
                <CartProvider>
                  <ChatProvider>
                    <ConditionalLayout>{children}</ConditionalLayout>
                  </ChatProvider>
                </CartProvider>
              </FavoritesProvider>
            </NotificationProvider>
          </AuthProvider>
        </CmsProvider>
      </body>
    </html>
  );
}
