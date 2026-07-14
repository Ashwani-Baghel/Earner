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

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const skip = parseInt(searchParams.get("skip") || "0", 10);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          status: { not: "PENDING" }, // Only show successful or processing payments, maybe we can show all for now? Let's show all
        },
        include: {
          buyer: { select: { name: true, email: true } },
          seller: { select: { name: true, email: true } },
          gig: { select: { title: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count(),
    ]);

    // Calculate basic revenue stats
    const successfulOrders = orders.filter(o => o.status === "COMPLETED" || o.status === "ACTIVE");
    const totalRevenue = successfulOrders.reduce((acc, o) => acc + o.price, 0);

    return NextResponse.json({
      orders,
      total,
      totalRevenue,
    });
  } catch (error: any) {
    console.error("Admin Payments Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
