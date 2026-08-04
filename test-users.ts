require('dotenv').config({ path: '.env.local' });
async function test() {
  const { prisma } = await import("./src/lib/prisma");
  const users = await prisma.user.findMany({});
  console.log('Total users:', users.length);

  const stats = await prisma.user.groupBy({
    by: ['role', 'isSeller'],
    _count: {
      _all: true
    }
  });
  console.log('Stats:', stats);
  
  await prisma.$disconnect();
}
test().catch(console.error);
