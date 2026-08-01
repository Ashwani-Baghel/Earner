import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminDb } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  try {
    await requireAdminDb(req);
    const permissions = await prisma.permission.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(permissions);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as any).message || "Internal Server Error" }, { status: 500 });
  }
}
