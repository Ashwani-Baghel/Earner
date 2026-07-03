const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const search = "video editing";
  const gigs = await prisma.gig.findMany({
    where: {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
        { category: { name: { contains: search, mode: "insensitive" } } },
        { subcategory: { name: { contains: search, mode: "insensitive" } } },
      ],
      status: { in: ["ACTIVE"] },
    },
    include: {
      category: true,
      subcategory: true,
      media: true,
      packages: true,
    }
  });
  console.log("Found gigs count:", gigs.length);
  if (gigs.length > 0) console.log("Gig Title:", gigs[0].title);
}
main().catch(console.error).finally(() => prisma.$disconnect());
