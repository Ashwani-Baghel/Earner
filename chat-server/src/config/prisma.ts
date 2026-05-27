import * as dotenv from "dotenv";
import path from "path";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../../src/generated/prisma/client";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is missing in .env.local");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter } as any);
