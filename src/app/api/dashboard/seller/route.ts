/**
 * GET /api/dashboard/seller
 * Returns aggregated statistics for the seller dashboard.
 *
 * Security:
 *   - Requires valid Firebase JWT
 *   - Requires user to have SELLER role in the database
 *   - Users can only access their own stats (decoded.uid)
 *   - Internal DB errors are NOT exposed in production
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError, ApiError } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);

    // ── Role check: only sellers can access this endpoint ──────────────
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.uid },
      include: { sellerProfile: true },
    });

    if (!dbUser) {
      throw new ApiError(404, "User not found. Please complete your profile setup.");
    }
    if (dbUser.role !== "SELLER") {
      throw new ApiError(403, "Access denied. This dashboard is for sellers only.");
    }

    // ── Fetch all seller stats in parallel ──────────────────────────────
    const [activeOrders, completedOrders, gigs, recentOrders, earningsAgg] = await Promise.all([
      prisma.order.count({
        where: { sellerId: decoded.uid, status: "ACTIVE" },
      }),
      prisma.order.count({
        where: { sellerId: decoded.uid, status: "COMPLETED" },
      }),
      prisma.gig.findMany({
        where: { sellerId: decoded.uid, status: "ACTIVE" },
        include: {
          media: { select: { url: true }, orderBy: { order: "asc" } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.order.findMany({
        where: { sellerId: decoded.uid },
        include: {
          gig: {
            select: {
              title: true,
              media: { select: { url: true }, orderBy: { order: "asc" } },
            },
          },
          buyer: { select: { name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.order.aggregate({
        where: { sellerId: decoded.uid, status: "COMPLETED" },
        _sum: { price: true },
      }),
    ]);

    const mappedGigs = gigs.map((gig: any) => {
      const images = gig.media.map((m: any) => m.url);
      const { media, ...gigRest } = gig;
      return {
        ...gigRest,
        images,
      };
    });

    const mappedOrders = recentOrders.map((order: any) => {
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

    return NextResponse.json({
      totalEarnings: earningsAgg._sum.price ?? 0,
      activeOrders,
      completedOrders,
      totalGigs: gigs.length,
      rating: dbUser.sellerProfile?.rating ?? 0,
      reviewCount: dbUser.sellerProfile?.reviewCount ?? 0,
      level: dbUser.sellerProfile?.level ?? "new",
      recentOrders: mappedOrders,
      activeGigs: mappedGigs,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
