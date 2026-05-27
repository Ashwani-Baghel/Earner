/**
 * GET  /api/admin/users — list all users with search
 * PATCH /api/admin/users — ban/unban/change role
 * DELETE /api/admin/users — delete a user (SUPER_ADMIN only)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminDb, handleApiError, ApiError } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  try {
    await requireAdminDb(req);
    const { searchParams } = new URL(req.url);
    const q    = searchParams.get("q") ?? "";
    const take = Math.min(Number(searchParams.get("limit") ?? 50), 200);
    const skip = Number(searchParams.get("offset") ?? 0);

    const users = await prisma.user.findMany({
      where: q
        ? {
            OR: [
              { name:  { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      select: {
        id: true, name: true, email: true, role: true,
        isBanned: true, isVerified: true, createdAt: true,
        _count: { select: { gigsAsSeller: true, ordersAsBuyer: true } },
      },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    });

    const total = await prisma.user.count({ where: q ? { OR: [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ]} : undefined });

    return NextResponse.json({ users, total });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminDb(req);
    const body = await req.json();
    const { userId, action, role } = body as {
      userId: string;
      action: "ban" | "unban" | "verify" | "unverify" | "changeRole";
      role?: string;
    };

    if (!userId || !action) {
      throw new ApiError(400, "userId and action are required.");
    }

    const validRoles = ["BUYER", "SELLER", "ADMIN", "SUPER_ADMIN"];
    let data: Record<string, unknown> = {};

    switch (action) {
      case "ban":      data = { isBanned: true };  break;
      case "unban":    data = { isBanned: false }; break;
      case "verify":   data = { isVerified: true };  break;
      case "unverify": data = { isVerified: false }; break;
      case "changeRole":
        if (!role || !validRoles.includes(role)) {
          throw new ApiError(400, `Invalid role. Must be one of: ${validRoles.join(", ")}`);
        }
        data = { role: role as any };
        break;
      default:
        throw new ApiError(400, "Invalid action.");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, role: true, isBanned: true, isVerified: true },
    });

    return NextResponse.json(updated);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { isSuper } = await requireAdminDb(req);
    if (!isSuper) throw new ApiError(403, "Only SUPER_ADMIN can delete users.");

    const { userId } = await req.json() as { userId: string };
    if (!userId) throw new ApiError(400, "userId is required.");

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
