import 'dotenv/config';
import { prisma } from "../src/lib/prisma";
import { CATEGORIES } from "../src/lib/mock-data/categories";

async function main() {
  console.log("Seeding CMS Configurations...");

  // 1. Seed Header
  await prisma.cmsConfig.upsert({
    where: { key: "HEADER" },
    update: {},
    create: {
      key: "HEADER",
      data: {
        logoText: "Earner.",
        logoImageUrl: "",
        links: [
          { label: "Explore", url: "/explore" },
          { label: "Become a Seller", url: "/seller/onboarding" }
        ]
      }
    }
  });

  // 2. Seed Hero
  await prisma.cmsConfig.upsert({
    where: { key: "HERO" },
    update: {},
    create: {
      key: "HERO",
      data: {
        headline: "Find the perfect freelance services for your business",
        subheadline: "Millions of people use Earner to turn their ideas into reality.",
        searchPlaceholder: "Try 'building mobile app'",
        backgroundImageUrl: ""
      }
    }
  });

  // 3. Seed Footer
  await prisma.cmsConfig.upsert({
    where: { key: "FOOTER" },
    update: {},
    create: {
      key: "FOOTER",
      data: {
        copyright: "© 2026 Earner International Ltd.",
        columns: [
          {
            title: "Categories",
            links: [
              { label: "Graphics & Design", url: "#" },
              { label: "Digital Marketing", url: "#" },
              { label: "Writing & Translation", url: "#" }
            ]
          },
          {
            title: "About",
            links: [
              { label: "Careers", url: "#" },
              { label: "Press & News", url: "#" },
              { label: "Partnerships", url: "#" }
            ]
          }
        ],
        social: {
          twitter: "",
          facebook: "",
          instagram: "",
          linkedin: ""
        }
      }
    }
  });

  console.log("Seeding Categories...");

  // Seed Categories and Subcategories
  for (const cat of CATEGORIES) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
        image: cat.image,
      },
      create: {
        slug: cat.slug,
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
        image: cat.image,
      }
    });

    for (const sub of cat.subcategories) {
      await prisma.subCategory.upsert({
        where: { slug: sub.slug },
        update: {
          name: sub.name,
          categoryId: createdCat.id
        },
        create: {
          slug: sub.slug,
          name: sub.name,
          categoryId: createdCat.id
        }
      });
    }
  }

  console.log("Seeding Complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
