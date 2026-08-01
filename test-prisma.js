const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.user.create({
      data: {
        id: "test-uid-12345",
        email: "test-admin@test.com",
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
    console.log("Success", res);
    await prisma.user.delete({ where: { id: "test-uid-12345" }});
  } catch (e) {
    console.error("PRISMA ERROR:", e);
  }
}
main();
