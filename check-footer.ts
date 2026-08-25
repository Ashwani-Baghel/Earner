import { prisma } from "./src/lib/prisma";

async function main() {
  const footerConfig = await prisma.cmsConfig.findUnique({
    where: { key: "FOOTER" }
  });
  console.log(JSON.stringify(footerConfig?.data, null, 2));
}

main().finally(() => prisma.$disconnect());
