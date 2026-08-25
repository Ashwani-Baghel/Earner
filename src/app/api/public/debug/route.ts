import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const configs = await prisma.cmsConfig.findMany();
  const banners = configs.find(c => c.key === "BANNERS");
  return NextResponse.json({ banners });
}
