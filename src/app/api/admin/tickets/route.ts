import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminDb, ApiError } from "@/lib/apiAuth";

// Fetch all support tickets for Super Admin
export async function GET(request: NextRequest) {
  try {
    const { isSuper } = await requireAdminDb(request);
    // requireAdminDb already verifies that the user is ADMIN or SUPER_ADMIN and throws if not.

    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, avatar: true } },
        _count: { select: { messages: true } }
      }
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error("Error fetching admin tickets:", error);
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
