/**
 * Prisma Client — server-side only (API routes only).
 *
 * Prisma v7 requires a driver adapter. We use PrismaPg with the pg driver.
 * DATABASE_URL is read from .env.local — NEVER use NEXT_PUBLIC_ prefix.
 *
 * The browser NEVER imports this module. It is only used in /api/* routes.
 *
 * Setup:
 *   1. Add DATABASE_URL to .env.local (get from Supabase or Neon)
 *   2. Run: npx prisma migrate dev --name init
 *   3. Run: npx prisma generate
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Prisma v7 singleton with PrismaPg adapter
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;

  if (!url) {
    // Return a stub during build-time static analysis — will throw at runtime
    console.warn(
      "[Prisma] DATABASE_URL is not set. DB operations will fail.\n" +
      "Add DATABASE_URL to .env.local (PostgreSQL connection string)."
    );
    // Provide a placeholder so the module loads without crashing the build
    const pool = new pg.Pool({ connectionString: "postgresql://localhost/placeholder" });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter } as never);
  }

  const pool = new pg.Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter } as never);
}

export const prisma: PrismaClient =
  (globalForPrisma.prisma && "category" in globalForPrisma.prisma)
    ? globalForPrisma.prisma
    : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
