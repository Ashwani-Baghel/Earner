require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const { prisma } = require("../src/lib/prisma");
const { CATEGORIES } = require("../src/lib/mock-data/categories");

async function main() {
  console.log("Seeding categories...");

  // We won't delete categories to prevent foreign key errors with existing Gigs.
  // Instead, we will upsert them.

  for (const cat of CATEGORIES) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        icon: cat.icon,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
      },
    });

    if (cat.megaGroups && cat.megaGroups.length > 0) {
      const seenSlugs = new Set();
      
      for (const group of cat.megaGroups) {
        for (const link of group.links) {
          if (!seenSlugs.has(link.slug)) {
            await prisma.subCategory.upsert({
              where: { slug: link.slug },
              update: {
                name: link.name,
                groupName: group.title,
                categoryId: createdCat.id,
              },
              create: {
                categoryId: createdCat.id,
                name: link.name,
                slug: link.slug,
                groupName: group.title,
              }
            });
            seenSlugs.add(link.slug);
          }
        }
      }
    } else if (cat.subcategories && cat.subcategories.length > 0) {
      for (const sub of cat.subcategories) {
        await prisma.subCategory.upsert({
          where: { slug: sub.slug },
          update: {
            name: sub.name,
            categoryId: createdCat.id,
          },
          create: {
            categoryId: createdCat.id,
            name: sub.name,
            slug: sub.slug,
          }
        });
      }
    }

    console.log(`Upserted category: ${cat.name}`);
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
