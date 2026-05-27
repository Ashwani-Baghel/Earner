/**
 * POST /api/users
 * Create or update a user record after signup / role selection.
 *
 * Security:
 *   - Requires valid Firebase JWT (Authorization: Bearer <token>)
 *   - Uses decoded.uid — never trusts user-supplied ID
 *   - All DB operations via Prisma (no raw SQL, no direct DB from browser)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError, ApiError } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    const body = await req.json() as {
      name?: string;
      email?: string;
      avatar?: string;
      role: "BUYER" | "SELLER";
    };

    const { name, email, avatar, role } = body;

    if (!["BUYER", "SELLER"].includes(role)) {
      throw new ApiError(400, "Invalid role. Must be BUYER or SELLER.");
    }

    // Upsert user — id is always the Firebase UID from the verified token
    const user = await prisma.user.upsert({
      where: { id: decoded.uid },
      create: {
        id: decoded.uid,
        email: email ?? decoded.email ?? "",
        name: name ?? decoded.name ?? "Anonymous",
        avatar: avatar ?? decoded.picture ?? null,
        role,
      },
      update: {
        name: name ?? decoded.name ?? undefined,
        avatar: avatar ?? decoded.picture ?? undefined,
        role,
      },
    });

    // Create a starter seller profile if role is SELLER
    if (role === "SELLER") {
      await prisma.sellerProfile.upsert({
        where: { userId: decoded.uid },
        create: { userId: decoded.uid },
        update: {},
      });
    }

    return NextResponse.json(user, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}

/**
 * GET /api/users/me — get the current user's profile
 */
export async function GET(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);

    const user = await prisma.user.findUnique({
      where: { id: decoded.uid },
      include: { sellerProfile: true },
    });

    if (!user) {
      // User authenticated but not yet in DB (first login before role selection)
      return NextResponse.json(null, { status: 204 });
    }

    return NextResponse.json(user);
  } catch (e) {
    return handleApiError(e);
  }
}
