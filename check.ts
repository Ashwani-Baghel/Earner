require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const writing = await prisma.category.findFirst({
    where: { slug: "writing-translation" },
    include: { subcategories: true }
  });
  console.log("Writing & Translation Subcategories:");
  console.log(JSON.stringify(writing?.subcategories, null, 2));
}

check().finally(() => prisma.$disconnect());
