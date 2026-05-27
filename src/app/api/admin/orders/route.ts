/**
 * GET   /api/admin/orders — list all orders with buyer/seller/gig info
 * PATCH /api/admin/orders — cancel or refund an order
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminDb, handleApiError, ApiError } from "@/lib/apiAuth";

const VALID_ACTIONS = ["cancel", "refund"];

export async function GET(req: NextRequest) {
  try {
    await requireAdminDb(req);
    const { searchParams } = new URL(req.url);
    const q      = searchParams.get("q") ?? "";
    const status = searchParams.get("status") ?? "";
    const take   = Math.min(Number(searchParams.get("limit") ?? 50), 200);
    const skip   = Number(searchParams.get("offset") ?? 0);

    const where: any = {};
    if (status) where.status = { equals: status as any };
    if (q) {
      where.OR = [
        { buyer:  { name: { contains: q, mode: "insensitive" } } },
        { seller: { name: { contains: q, mode: "insensitive" } } },
        { gig:    { title: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          buyer:  { select: { id: true, name: true, email: true } },
          seller: { select: { id: true, name: true, email: true } },
          gig:    { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminDb(req);
    const { orderId, action } = await req.json() as { orderId: string; action: string };

    if (!orderId || !action) throw new ApiError(400, "orderId and action are required.");
    if (!VALID_ACTIONS.includes(action)) {
      throw new ApiError(400, `Invalid action. Must be one of: ${VALID_ACTIONS.join(", ")}`);
    }

    const newStatus = action === "cancel" ? "CANCELLED" : "REFUNDED";
    const updated = await prisma.order.update({
      where: { id: orderId },
      data:  { status: newStatus as any },
    });

    return NextResponse.json(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
