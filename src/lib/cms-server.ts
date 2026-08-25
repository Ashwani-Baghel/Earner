import { prisma } from "./prisma";

export async function getCmsConfig() {
  const configs = await prisma.cmsConfig.findMany();
  
  const header = configs.find(c => c.key === "HEADER")?.data || {
    logoText: "Earner.",
    logoImageUrl: "",
    links: [
      { label: "Explore", url: "/explore" },
      { label: "Become a Seller", url: "/seller/onboarding" }
    ]
  };

  const heroDbData = configs.find(c => c.key === "HERO")?.data as Record<string, any> || {};
  const hero = {
    headline: heroDbData.headline || "Find the perfect freelance services for your business",
    subheadline: heroDbData.subheadline || "Millions of people use Earner to turn their ideas into reality.",
    searchPlaceholder: heroDbData.searchPlaceholder || "Try 'building mobile app'",
    backgroundImageUrl: heroDbData.backgroundImageUrl || "",
    popularSearches: heroDbData.popularSearches || [
      "Website Development",
      "Logo Design",
      "SEO",
      "Video Editing"
    ],
    trustedBrands: heroDbData.trustedBrands || [
      { name: "Meta", wordmark: "𝗠eta", style: "font-size:15px; font-weight:800; letter-spacing:-0.5px" },
      { name: "Google", wordmark: "Google", style: "font-size:15px; font-weight:600; letter-spacing:-0.3px" },
      { name: "Netflix", wordmark: "NETFLIX", style: "font-size:13px; font-weight:900; letter-spacing:1px" },
      { name: "P&G", wordmark: "P&G", style: "font-size:14px; font-weight:700" },
      { name: "PayPal", wordmark: "PayPal", style: "font-size:14px; font-weight:700; letter-spacing:-0.3px" },
      { name: "Payoneer", wordmark: "◯Payoneer", style: "font-size:13px; font-weight:600" }
    ]
  };

  const footer = configs.find(c => c.key === "FOOTER")?.data || {
    copyright: "© 2026 Earner International Ltd.",
    columns: [],
    social: { twitter: "", facebook: "", instagram: "", linkedin: "" }
  };

  const announcement = configs.find(c => c.key === "announcement-bar")?.data || null;
  const contact = configs.find(c => c.key === "contact-information")?.data || null;
  const socials = configs.find(c => c.key === "social-links")?.data || null;
  const faqs = configs.find(c => c.key === "faqs")?.data || null;
  const banners = configs.find(c => c.key === "BANNERS")?.data || { items: [] };
  const testimonials = configs.find(c => c.key === "TESTIMONIALS")?.data || { items: [] };
  
  const themeDbData = configs.find(c => c.key === "THEME")?.data as any;
  const theme = themeDbData || {
    brandPrimary: "#0d9488",
    brandDark: "#0f766e",
    brandLight: "#ccfbf1",
    textMain: "#1e293b",
    textMuted: "#64748b",
    borderLight: "#e2e8f0",
    bgMain: "#f8fafc",
    bgWhite: "#ffffff",
    accentYellow: "#f59e0b",
    accentRed: "#ef4444",
    accentBlue: "#3b82f6",
    fontFamily: "Inter",
    headingsFont: "Inter"
  };

  const platformSettingsRecord = await prisma.platformSettings.findUnique({
    where: { id: "global" }
  });
  const globalSettings = platformSettingsRecord?.data as any || {};

  return { header, hero, footer, announcement, contact, socials, faqs, banners, testimonials, theme, globalSettings };
}

export async function getCmsCategories() {
  const categories = await prisma.category.findMany({
    include: {
      subcategories: true
    },
    orderBy: { sortOrder: "asc" }
  });
  
  return categories;
}
