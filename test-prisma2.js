require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.user.create({
      data: {
        id: "test-uid-123456",
        email: "test-admin2@test.com",
        name: "Test",
        role: "ADMIN",
        adminProfile: {
          create: {
            isActive: true,
            roleId: null,
            permissions: {
              create: []
            }
          }
        }
      }
    });
    console.log("Success");
    await prisma.user.delete({ where: { id: "test-uid-123456" }});
  } catch (e) {
    console.error("PRISMA ERROR:", e);
  }
}
main();
