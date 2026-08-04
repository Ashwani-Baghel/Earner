require('dotenv').config({ path: '.env.local' });

async function main() {
  const { prisma } = await import("./src/lib/prisma");
  const result = await prisma.user.updateMany({
    where: {
      OR: [
        { role: 'SELLER' },
        { sellerProfile: { isNot: null } }
      ]
    },
    data: {
      isSeller: true
    }
  });
  console.log('Updated users:', result.count);
  await prisma.$disconnect();
}
main().catch(console.error);
