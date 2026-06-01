/**
 * GET /api/admin/analytics — aggregated platform analytics
 * Returns: daily revenue/orders (last 30 days), user growth, top sellers
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminDb, handleApiError } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdminDb(req);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalRevenue,
      recentOrders,
      recentUsers,
      topSellers,
      gigStatusCounts,
      orderStatusCounts,
    ] = await Promise.all([
      // Total revenue from completed orders
      prisma.order.aggregate({
        where: { status: { in: ["COMPLETED"] as any[] } },
        _sum: { price: true },
      }),

      // Orders in last 30 days for daily chart
      prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, price: true, status: true },
        orderBy: { createdAt: "asc" },
      }),

      // User signups in last 30 days
      prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, role: true },
        orderBy: { createdAt: "asc" },
      }),

      // Top 5 sellers by earnings
      prisma.sellerProfile.findMany({
        orderBy: { earnings: "desc" },
        take: 5,
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
        },
      }),

      // Gig status distribution
      prisma.gig.groupBy({
        by: ["status"],
        _count: { id: true },
      }),

      // Order status distribution
      prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
    ]);

    // Aggregate orders by day
    const dailyMap: Record<string, { revenue: number; orders: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = { revenue: 0, orders: 0 };
    }
    for (const order of recentOrders) {
      const key = order.createdAt.toISOString().slice(0, 10);
      if (dailyMap[key]) {
        dailyMap[key].orders += 1;
        if (String(order.status) === "COMPLETED") {
          dailyMap[key].revenue += order.price;
        }
      }
    }
    const daily = Object.entries(dailyMap).map(([date, v]) => ({ date, ...v }));

    // Aggregate users by day
    const userMap: Record<string, number> = {};
    Object.keys(dailyMap).forEach((k) => (userMap[k] = 0));
    for (const u of recentUsers) {
      const key = u.createdAt.toISOString().slice(0, 10);
      if (userMap[key] !== undefined) userMap[key] += 1;
    }
    const userGrowth = Object.entries(userMap).map(([date, count]) => ({ date, count }));

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.price ?? 0,
      daily,
      userGrowth,
      topSellers: topSellers.map((s) => ({
        id: s.userId,
        name: s.user.name,
        email: s.user.email,
        avatar: s.user.avatar,
        earnings: s.earnings,
        totalOrders: s.totalOrders,
        rating: s.rating,
        level: s.level,
      })),
      gigStatusCounts: gigStatusCounts.map((g) => ({
        status: String(g.status),
        count: g._count.id,
      })),
      orderStatusCounts: orderStatusCounts.map((o) => ({
        status: String(o.status),
        count: o._count.id,
      })),
    });
  } catch (e) {
    return handleApiError(e);
  }
}
