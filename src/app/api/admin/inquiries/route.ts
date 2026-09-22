import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminDb, handleApiError } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  try {
    const { isSuper } = await requireAdminDb(req);
    if (!isSuper) {
      return NextResponse.json({ error: "Unauthorized. Super Admin required." }, { status: 403 });
    }

    const inquiries = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ inquiries }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
