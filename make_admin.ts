import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as admin from "firebase-admin";
import { config } from "dotenv";

config({ path: ".env.local" });

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  const email = "ashwanibaghel400@gmail.com";
  
  // Try to find the user in Firebase first
  console.log(`Searching for user ${email} in Firebase Auth...`);
  let firebaseUser;
  try {
    firebaseUser = await admin.auth().getUserByEmail(email);
  } catch (err) {
    console.error("Could not find user in Firebase Auth. Make sure you have signed up/logged in on the frontend first!");
    return;
  }

  console.log(`Found Firebase user. UID: ${firebaseUser.uid}`);
  console.log("Upserting user into PostgreSQL with ADMIN role...");

  const updatedUser = await prisma.user.upsert({
    where: { id: firebaseUser.uid },
    create: {
      id: firebaseUser.uid,
      email: firebaseUser.email ?? email,
      name: firebaseUser.displayName ?? "Admin",
      avatar: firebaseUser.photoURL ?? null,
      role: "ADMIN"
    },
    update: {
      role: "ADMIN"
    }
  });

  console.log(`Successfully made ${email} an ADMIN!`, updatedUser);
}

main().catch(console.error).finally(() => prisma.$disconnect());
