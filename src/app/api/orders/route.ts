/**
 * GET  /api/orders        — list orders for current user (buyer or seller)
 * POST /api/orders        — place a new order (BUYER only)
 *
 * Security:
 *   - Both require valid Firebase JWT
 *   - POST requires BUYER role (checked in DB)
 *   - buyerId is always decoded.uid — never from the request body
 *   - Gig existence verified before creating order
 *   - Price is read from the gig record — not from request body (prevents price manipulation)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError, ApiError } from "@/lib/apiAuth";

// ── GET /api/orders ───────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const asRole = searchParams.get("role"); // "buyer" | "seller"
    const status = searchParams.get("status");

    const validStatuses = ["PENDING", "ACTIVE", "DELIVERED", "REVISION", "COMPLETED", "CANCELLED"];
    if (status && !validStatuses.includes(status.toUpperCase())) {
      throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    // Build where clause based on requested role
    const where = {
      ...(asRole === "seller" ? { sellerId: decoded.uid } : { buyerId: decoded.uid }),
      ...(status ? { status: status.toUpperCase() as never } : {}),
    };

    const orders = await prisma.order.findMany({
      where,
      include: {
        gig: {
          select: {
            id: true,
            title: true,
            media: { select: { url: true }, orderBy: { order: "asc" } },
          },
        },
        buyer: { select: { id: true, name: true, avatar: true } },
        seller: { select: { id: true, name: true, avatar: true } },
        review: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const mappedOrders = orders.map((order: any) => {
      const images = (order.gig?.media || []).map((m: any) => m.url);
      const { media, ...gigRest } = order.gig || {};
      return {
        ...order,
        gig: {
          ...gigRest,
          images,
        },
      };
    });

    return NextResponse.json(mappedOrders);
  } catch (e) {
    return handleApiError(e);
  }
}

// ── POST /api/orders ──────────────────────────────────────────────────────────
// Place a new order — BUYER only
export async function POST(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);

    // ── Role check: only BUYERS can place orders ──────────────────────
    const dbUser = await prisma.user.findUnique({ where: { id: decoded.uid } });
    if (!dbUser) throw new ApiError(404, "User not found. Please complete your profile setup.");
    if (dbUser.role !== "BUYER") {
      throw new ApiError(403, "Only buyers can place orders.");
    }

    const body = await req.json() as {
      gigId?: string;
      packageTier?: "basic" | "standard" | "premium";
      requirements?: string;
    };

    // ── Input validation ──────────────────────────────────────────────
    if (!body.gigId) throw new ApiError(400, "gigId is required.");
    if (!body.packageTier || !["basic", "standard", "premium"].includes(body.packageTier)) {
      throw new ApiError(400, "packageTier must be: basic, standard, or premium.");
    }

    // ── Verify gig exists and is purchasable ─────────────────────────
    const gig = await prisma.gig.findUnique({
      where: { id: body.gigId },
      include: { packages: true },
    });
    if (!gig || gig.status !== "ACTIVE") {
      throw new ApiError(404, "Gig not found or no longer available.");
    }

    // ── Prevent buying your own gig ───────────────────────────────────
    if (gig.sellerId === decoded.uid) {
      throw new ApiError(400, "You cannot purchase your own gig.");
    }

    // ── Price comes from DB — never from the request body ────────────
    const tierName = body.packageTier.toUpperCase();
    const dbPkg = gig.packages.find((p) => p.tier === tierName);
    if (!dbPkg) {
      throw new ApiError(400, `Package tier ${body.packageTier} not found on this gig.`);
    }

    const price = Number(dbPkg.price);
    const deliveryDays = Number(dbPkg.deliveryDays) || 3;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + deliveryDays);

    if (!price || price <= 0) {
      throw new ApiError(500, "Invalid package pricing. Please contact support.");
    }

    // ── Create order — buyerId from JWT, sellerId from gig record ─────
    const order = await prisma.order.create({
      data: {
        gigId: body.gigId,
        buyerId: decoded.uid,          // ← always from JWT
        sellerId: gig.sellerId,         // ← always from DB record
        packageTier: body.packageTier,
        price,                          // ← always from DB record
        requirements: body.requirements ?? null,
        dueDate,
        status: "PENDING",
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
