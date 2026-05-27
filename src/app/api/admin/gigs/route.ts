/**
 * GET   /api/admin/gigs — list all gigs (admin view, all statuses)
 * PATCH /api/admin/gigs — update gig status (approve/reject/ban)
 * DELETE /api/admin/gigs — permanently delete a gig
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminDb, handleApiError, ApiError } from "@/lib/apiAuth";

const VALID_STATUSES = ["DRAFT", "PENDING", "ACTIVE", "REJECTED", "PAUSED", "BANNED", "DELETED"];

export async function GET(req: NextRequest) {
  try {
    await requireAdminDb(req);
    const { searchParams } = new URL(req.url);
    const q      = searchParams.get("q") ?? "";
    const status = searchParams.get("status") ?? "";
    const take   = Math.min(Number(searchParams.get("limit") ?? 50), 200);
    const skip   = Number(searchParams.get("offset") ?? 0);

    const where: any = {};
    if (q) {
      where.OR = [
        { title:    { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ];
    }
    if (status && VALID_STATUSES.includes(status)) {
      where.status = { equals: status as any };
    }

    const [gigs, total] = await Promise.all([
      prisma.gig.findMany({
        where,
        include: {
          seller: { select: { id: true, name: true, email: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.gig.count({ where }),
    ]);

    return NextResponse.json({ gigs, total });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminDb(req);
    const body = await req.json();
    const { gigId, status } = body as { gigId: string; status: string };

    if (!gigId || !status) {
      throw new ApiError(400, "gigId and status are required.");
    }
    if (!VALID_STATUSES.includes(status)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    const updated = await prisma.gig.update({
      where: { id: gigId },
      data:  { status: status as any },
      include: { seller: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(updated);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdminDb(req);
    const { gigId } = await req.json() as { gigId: string };
    if (!gigId) throw new ApiError(400, "gigId is required.");

    await prisma.gig.delete({ where: { id: gigId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
