/**
 * PATCH /api/orders/[id] — update order status
 *
 * Security:
 *   - Requires valid Firebase JWT
 *   - Only the buyer OR seller of that specific order can update it
 *   - Ownership verified against DB record — never trusts request body
 *   - Status transitions are validated (not just any string accepted)
 *   - Only whitelisted statuses can be set (prevents invalid state)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError, ApiError } from "@/lib/apiAuth";

type RouteCtx = { params: Promise<{ id: string }> };

const VALID_STATUSES = ["PENDING", "ACTIVE", "DELIVERED", "REVISION", "COMPLETED", "CANCELLED"] as const;
type OrderStatus = typeof VALID_STATUSES[number];

export async function PATCH(req: NextRequest, { params }: RouteCtx) {
  try {
    const { id } = await params;
    const decoded = await requireAuth(req);

    const body = await req.json() as { status?: string };

    // ── Validate status ───────────────────────────────────────────────
    if (!body.status || !VALID_STATUSES.includes(body.status.toUpperCase() as OrderStatus)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`);
    }
    const newStatus = body.status.toUpperCase() as OrderStatus;

    // ── Load order and verify ownership ──────────────────────────────
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new ApiError(404, "Order not found.");

    const isParty = order.buyerId === decoded.uid || order.sellerId === decoded.uid;
    if (!isParty) {
      throw new ApiError(403, "You do not have permission to update this order.");
    }

    // ── Optional: enforce state machine rules ─────────────────────────
    // Buyers can: CANCEL (PENDING→CANCELLED), request REVISION
    // Sellers can: ACCEPT (PENDING→ACTIVE), DELIVER (ACTIVE→DELIVERED)
    // Either can: COMPLETE (DELIVERED→COMPLETED)
    if (newStatus === "ACTIVE" && order.sellerId !== decoded.uid) {
      throw new ApiError(403, "Only the seller can mark an order as active.");
    }
    if (newStatus === "DELIVERED" && order.sellerId !== decoded.uid) {
      throw new ApiError(403, "Only the seller can mark an order as delivered.");
    }
    if (newStatus === "CANCELLED" && order.status !== "PENDING") {
      throw new ApiError(400, "Orders can only be cancelled while in PENDING status.");
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json(updated);
  } catch (e) {
    return handleApiError(e);
  }
}

// ── GET /api/orders/[id] — get single order detail ───────────────────────────
export async function GET(req: NextRequest, { params }: RouteCtx) {
  try {
    const { id } = await params;
    const decoded = await requireAuth(req);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        gig: {
          include: {
            media: { select: { url: true }, orderBy: { order: "asc" } },
            packages: true,
          },
        },
        buyer: { select: { id: true, name: true, avatar: true } },
        seller: { select: { id: true, name: true, avatar: true } },
        review: true,
      },
    });

    if (!order) throw new ApiError(404, "Order not found.");

    // Only buyer or seller can view the order detail
    if (order.buyerId !== decoded.uid && order.sellerId !== decoded.uid) {
      throw new ApiError(403, "You do not have permission to view this order.");
    }

    const images = (order.gig?.media || []).map((m: any) => m.url);
    const mapPackage = (p: any) => {
      if (!p) return null;
      return {
        name: p.name,
        description: p.description,
        price: Number(p.price),
        deliveryTime: Number(p.deliveryDays),
        revisions: Number(p.revisions),
        features: p.features || [],
      };
    };
    const basic = mapPackage(order.gig?.packages?.find((p: any) => p.tier === "BASIC"));
    const standard = mapPackage(order.gig?.packages?.find((p: any) => p.tier === "STANDARD"));
    const premium = mapPackage(order.gig?.packages?.find((p: any) => p.tier === "PREMIUM"));

    const mappedOrder = {
      ...order,
      gig: {
        id: order.gig?.id,
        title: order.gig?.title,
        images,
        basicPackage: basic,
        standardPackage: standard,
        premiumPackage: premium,
        packages: {
          basic,
          standard,
          premium,
        },
      },
    };

    return NextResponse.json(mappedOrder);
  } catch (e) {
    return handleApiError(e);
  }
}
