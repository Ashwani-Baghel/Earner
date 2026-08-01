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

  const hero = configs.find(c => c.key === "HERO")?.data || {
    headline: "Find the perfect freelance services for your business",
    subheadline: "Millions of people use Earner to turn their ideas into reality.",
    searchPlaceholder: "Try 'building mobile app'",
    backgroundImageUrl: ""
  };

  const footer = configs.find(c => c.key === "FOOTER")?.data || {
    copyright: "© 2026 Earner International Ltd.",
    columns: [],
    social: { twitter: "", facebook: "", instagram: "", linkedin: "" }
  };

  return { header, hero, footer };
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
