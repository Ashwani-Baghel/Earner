/**
 * GET /api/dashboard/buyer
 * Returns aggregated statistics for the buyer dashboard.
 *
 * Security:
 *   - Requires valid Firebase JWT
 *   - Users can only access their own stats (decoded.uid)
 *   - Internal DB errors are NOT exposed in production
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError, ApiError } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);

    // ── Verify user exists (not strictly role-locked, buyers CAN be sellers too) ──
    const dbUser = await prisma.user.findUnique({ where: { id: decoded.uid } });
    if (!dbUser) {
      throw new ApiError(404, "User not found. Please complete your profile setup.");
    }
    if (String(dbUser.role) !== "BUYER") {
      throw new ApiError(403, "Access denied. This dashboard is for buyers only.");
    }

    // ── Fetch all buyer stats in parallel ──────────────────────────────
    const [activeOrders, completedOrders, recentOrders, spentAgg] = await Promise.all([
      prisma.order.count({
        where: { buyerId: decoded.uid, status: "ACTIVE" },
      }),
      prisma.order.count({
        where: { buyerId: decoded.uid, status: "COMPLETED" },
      }),
      prisma.order.findMany({
        where: { buyerId: decoded.uid },
        include: {
          gig: {
            select: {
              title: true,
              media: { select: { url: true }, orderBy: { order: "asc" } },
            },
          },
          seller: { select: { name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.order.aggregate({
        where: { buyerId: decoded.uid, status: "COMPLETED" },
        _sum: { price: true },
      }),
    ]);

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
      activeOrders,
      completedOrders,
      totalSpent: spentAgg._sum.price ?? 0,
      recentOrders: mappedOrders,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
