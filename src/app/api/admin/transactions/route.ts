import { NextRequest, NextResponse } from "next/server";
import { requireAdminDb } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requireAdminDb(req);

    const { searchParams } = new URL(req.url);
    const take = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("offset") || "0");
    const type = searchParams.get("type"); // e.g. PAYOUT, REFUND, PLATFORM_FEE

    const where = type ? { type: type as any } : {};

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          order: { select: { id: true, gig: { select: { title: true } } } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    // Map output to simplify the structure for frontend
    const mapped = transactions.map(t => ({
      ...t,
      order: t.order ? { id: t.order.id, gigTitle: t.order.gig.title } : null
    }));

    return NextResponse.json({ transactions: mapped, total });
  } catch (error: any) {
    console.error("Fetch transactions error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch transactions" },
      { status: error.status || 500 }
    );
  }
}
