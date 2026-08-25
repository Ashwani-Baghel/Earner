import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const configs = await prisma.cmsConfig.findMany();
  const banners = configs.find((c: any) => c.key === "BANNERS");
  console.log("BANNERS config:", JSON.stringify(banners, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
