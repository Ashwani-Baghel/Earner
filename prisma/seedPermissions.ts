import { prisma } from "../src/lib/prisma";


const permissions = [
  // User Management
  { name: 'users.view', description: 'Can view list of users and their details' },
  { name: 'users.manage', description: 'Can edit, suspend, and delete users' },
  
  // Gig Management
  { name: 'gigs.view', description: 'Can view all gigs including drafts' },
  { name: 'gigs.manage', description: 'Can approve, reject, or delete gigs' },
  
  // Order Management
  { name: 'orders.view', description: 'Can view all orders and transactions' },
  { name: 'orders.manage', description: 'Can manage order statuses and process refunds' },
  
  // Categories
  { name: 'categories.manage', description: 'Can create, edit, sort, and delete categories' },
  
  // CMS & Content
  { name: 'content.manage', description: 'Can edit Header, Footer, Hero, and Homepage layout' },
  
  // Analytics
  { name: 'analytics.view', description: 'Can view platform analytics and revenue data' },
  
  // Admin & Settings
  { name: 'admins.manage', description: 'Can create and manage other staff admins' },
  { name: 'settings.manage', description: 'Can update platform global settings' },
];

async function main() {
  console.log('Seeding standard permissions...');
  
  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: { name: perm.name, description: perm.description },
    });
  }
  
  console.log('Permissions seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Connection managed by db instance
  });
