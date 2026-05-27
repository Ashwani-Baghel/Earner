/**
 * GET    /api/gigs/[id] — single gig detail (public)
 * PUT    /api/gigs/[id] — update gig (owner SELLER only)
 * DELETE /api/gigs/[id] — soft-delete gig (owner SELLER only)
 *
 * Security:
 *   - GET is public (no auth needed)
 *   - PUT/DELETE require JWT + ownership check (gig.sellerId === decoded.uid)
 *   - Ownership verified in DB — never trusts request body for IDs
 *   - Only whitelisted fields can be updated (no raw body pass-through)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError, ApiError } from "@/lib/apiAuth";

type RouteCtx = { params: Promise<{ id: string }> };

// ── GET /api/gigs/[id] ────────────────────────────────────────────────────────
// Public — no auth required
export async function GET(_req: NextRequest, { params }: RouteCtx) {
  try {
    const { id } = await params;
    const gig = await prisma.gig.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            avatar: true,
            sellerProfile: true,
          },
        },
        reviews: {
          include: { buyer: { select: { name: true, avatar: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        packages: true,
        media: true,
        faqs: true,
        requirements: true,
        category: true,
        subcategory: true,
      },
    });

    if (!gig) throw new ApiError(404, "Gig not found.");
    if (gig.status === "DELETED") throw new ApiError(404, "Gig not found.");

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

    const basic = mapPackage(gig.packages.find(p => p.tier === "BASIC"));
    const standard = mapPackage(gig.packages.find(p => p.tier === "STANDARD"));
    const premium = mapPackage(gig.packages.find(p => p.tier === "PREMIUM"));

    const mappedGig = {
      ...gig,
      category: gig.category?.name || "Other",
      subcategory: gig.subcategory?.name || null,
      images: gig.media.sort((a, b) => a.order - b.order).map(m => m.url),
      basicPackage: basic,
      standardPackage: standard,
      premiumPackage: premium,
      packages: {
        basic,
        standard,
        premium,
      },
    };

    return NextResponse.json(mappedGig);
  } catch (e) {
    return handleApiError(e);
  }
}

// ── PUT /api/gigs/[id] ────────────────────────────────────────────────────────
// Requires JWT + ownership
export async function PUT(req: NextRequest, { params }: RouteCtx) {
  try {
    const { id } = await params;
    const decoded = await requireAuth(req);

    // ── Ownership check ───────────────────────────────────────────────
    const gig = await prisma.gig.findUnique({ where: { id } });
    if (!gig || gig.status === "DELETED") throw new ApiError(404, "Gig not found.");
    if (gig.sellerId !== decoded.uid) {
      throw new ApiError(403, "You can only edit your own gigs.");
    }

    // ── Whitelist updatable fields — never pass body directly to Prisma ──
    const body = await req.json() as {
      title?: string;
      description?: string;
      categoryId?: string;
      subcategoryId?: string;
      tags?: string[];
      status?: "ACTIVE" | "PAUSED";
    };

    const updated = await prisma.gig.update({
      where: { id },
      data: {
        ...(body.title ? { title: body.title.trim() } : {}),
        ...(body.description ? { description: body.description.trim() } : {}),
        ...(body.categoryId ? { categoryId: body.categoryId } : {}),
        ...(body.subcategoryId !== undefined ? { subcategoryId: body.subcategoryId } : {}),
        ...(body.tags ? { tags: body.tags } : {}),
        ...(body.status ? { status: body.status } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    return handleApiError(e);
  }
}

// ── DELETE /api/gigs/[id] ─────────────────────────────────────────────────────
// Soft-delete — sets status to DELETED, ownership required
export async function DELETE(req: NextRequest, { params }: RouteCtx) {
  try {
    const { id } = await params;
    const decoded = await requireAuth(req);

    const gig = await prisma.gig.findUnique({ where: { id } });
    if (!gig || gig.status === "DELETED") throw new ApiError(404, "Gig not found.");
    if (gig.sellerId !== decoded.uid) {
      throw new ApiError(403, "You can only delete your own gigs.");
    }

    await prisma.gig.update({ where: { id }, data: { status: "DELETED" } });
    return NextResponse.json({ success: true, message: "Gig deleted." });
  } catch (e) {
    return handleApiError(e);
  }
}
