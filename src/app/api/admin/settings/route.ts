import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);

    // Verify Admin
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      select: { role: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let settings = await prisma.systemSetting.findUnique({
      where: { id: "global" }
    });

    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: { id: "global" }
      });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Get Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);

    // Verify Super Admin (or Admin if allowed, let's allow Admin for basic settings)
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      select: { role: true },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updates = await req.json();

    const settings = await prisma.systemSetting.upsert({
      where: { id: "global" },
      update: {
        feePct: updates.feePct,
        maintenance: updates.maintenance,
        contactEmail: updates.contactEmail,
      },
      create: {
        id: "global",
        feePct: updates.feePct ?? 5.0,
        maintenance: updates.maintenance ?? false,
        contactEmail: updates.contactEmail ?? "support@earner.com",
      }
    });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("Update Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
