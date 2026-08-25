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
  const { header, hero, footer, banners, testimonials, announcement, contact, socials, faqs, theme, globalSettings } = await getCmsConfig();
  const categories = await getCmsCategories();

  // Dynamic CSS Theme Injection
  const themeCss = `
    :root {
      /* Base brand colors */
      --color-brand-primary: ${theme?.brandPrimary || '#0d9488'} !important;
      --color-brand-dark: ${theme?.brandDark || '#0f766e'} !important;
      --color-brand-light: ${theme?.brandLight || '#ccfbf1'} !important;
      --color-text-main: ${theme?.textMain || '#1e293b'} !important;
      --color-text-muted: ${theme?.textMuted || '#64748b'} !important;
      --color-border-light: ${theme?.borderLight || '#e2e8f0'} !important;
      --color-bg-main: ${theme?.bgMain || '#f8fafc'} !important;
      --color-bg-white: ${theme?.bgWhite || '#ffffff'} !important;
      --color-accent-yellow: ${theme?.accentYellow || '#f59e0b'} !important;
      --color-accent-red: ${theme?.accentRed || '#ef4444'} !important;
      --color-accent-blue: ${theme?.accentBlue || '#3b82f6'} !important;
      
      /* Override Tailwind's hardcoded teal scale with brand colors */
      --color-teal-50: ${theme?.brandLight || '#ccfbf1'} !important;
      --color-teal-100: ${theme?.brandLight || '#ccfbf1'} !important;
      --color-teal-200: ${theme?.brandLight || '#ccfbf1'} !important;
      --color-teal-500: ${theme?.brandPrimary || '#0d9488'} !important;
      --color-teal-600: ${theme?.brandPrimary || '#0d9488'} !important;
      --color-teal-700: ${theme?.brandDark || '#0f766e'} !important;
      --color-teal-800: ${theme?.brandDark || '#0f766e'} !important;

      /* Override Tailwind's hardcoded slate scale with brand structure */
      --color-slate-50: ${theme?.bgMain || '#f8fafc'} !important;
      --color-slate-100: ${theme?.bgMain || '#f8fafc'} !important;
      --color-slate-200: ${theme?.borderLight || '#e2e8f0'} !important;
      --color-slate-300: ${theme?.borderLight || '#cbd5e1'} !important;
      --color-slate-400: ${theme?.textMuted || '#94a3b8'} !important;
      --color-slate-500: ${theme?.textMuted || '#64748b'} !important;
      --color-slate-600: ${theme?.textMuted || '#475569'} !important;
      --color-slate-700: ${theme?.textMain || '#334155'} !important;
      --color-slate-800: ${theme?.textMain || '#1e293b'} !important;
      --color-slate-900: ${theme?.textMain || '#0f172a'} !important;

      /* Typography */
      --font-sans: "${theme?.fontFamily || 'Inter'}", "Helvetica Neue", Arial, sans-serif !important;
      --font-headings: "${theme?.headingsFont || 'Inter'}", "Helvetica Neue", Arial, sans-serif !important;
    }
    
    body { font-family: var(--font-sans); }
    h1, h2, h3, h4, h5, h6 { font-family: var(--font-headings); }
  `;

  // Extract custom fonts to load from Google Fonts if they aren't 'system-ui'
  const customFonts = [theme?.fontFamily, theme?.headingsFont]
    .filter(f => f && f !== 'system-ui')
    .map(f => f.replace(/ /g, '+'));
  const uniqueFonts = Array.from(new Set(customFonts));
  const googleFontsUrl = uniqueFonts.length > 0
    ? `https://fonts.googleapis.com/css2?${uniqueFonts.map(f => `family=${f}:wght@300;400;500;600;700;800`).join('&')}&display=swap`
    : null;

  return (
    <html lang="en" className={inter.variable}>
      <head>
        {googleFontsUrl && <link rel="stylesheet" href={googleFontsUrl} />}
        {globalSettings?.favicon && <link rel="icon" href={globalSettings.favicon} />}
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body className="min-h-screen flex flex-col bg-white overflow-x-hidden w-full max-w-[100vw]">
        <CmsProvider initialData={{ header, hero, footer, categories, banners, testimonials, announcement, contact, socials, faqs, theme, globalSettings }}>
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
