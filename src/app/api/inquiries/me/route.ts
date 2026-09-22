import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ApiError } from "@/lib/apiAuth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inquiries = await prisma.contactMessage.findMany({
      where: { email: user.email },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ inquiries });
  } catch (error: any) {
    console.error("Error fetching inquiries:", error);
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
