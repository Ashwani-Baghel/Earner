require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const { prisma } = require("../src/lib/prisma");
const { CATEGORIES } = require("../src/lib/mock-data/categories");

async function main() {
  console.log("Seeding categories...");

  // Delete existing categories to prevent duplicates during seed
  await prisma.category.deleteMany({});
  await prisma.subCategory.deleteMany({});

  for (const cat of CATEGORIES) {
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
      },
    });

    if (cat.subcategories && cat.subcategories.length > 0) {
      await prisma.subCategory.createMany({
        data: cat.subcategories.map((sub: any) => ({
          categoryId: createdCat.id,
          name: sub.name,
          slug: sub.slug,
        })),
      });
    }

    console.log(`Created category: ${cat.name}`);
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
