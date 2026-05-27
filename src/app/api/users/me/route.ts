import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/firebaseAdmin";

// GET /api/users/me — fetch the current user's profile + role
export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    const user = await prisma.user.findUnique({
      where: { id: decoded.uid },
      include: { sellerProfile: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
