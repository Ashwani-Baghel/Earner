import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);

    const user = await prisma.user.findUnique({
      where: { id: decoded.uid },
      select: { role: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const settings = await prisma.platformSettings.findUnique({
      where: { id: "global" }
    });

    return NextResponse.json(settings?.data || {});
  } catch (error: unknown) {
    console.error("Get Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);

    const user = await prisma.user.findUnique({
      where: { id: decoded.uid },
      select: { role: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = await req.json();

    const settings = await prisma.platformSettings.upsert({
      where: { id: "global" },
      update: { data: payload },
      create: { id: "global", data: payload }
    });

    return NextResponse.json(settings.data);
  } catch (error: unknown) {
    console.error("Update Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
