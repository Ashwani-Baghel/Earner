import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/firebaseAdmin";

// GET /api/users/me — fetch the current user's profile + role
export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    const user = await prisma.user.findUnique({
      where: { id: decoded.uid },
      include: { 
        sellerProfile: true,
        adminProfile: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } }
              }
            },
            permissions: {
              include: { permission: true }
            }
          }
        }
      },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    
    // Map permissions to a simple string array for the frontend
    let permissions: string[] = [];
    if (user.role === "SUPER_ADMIN") {
      permissions = ["*"]; // Super admin has all permissions
    } else if (user.adminProfile) {
      const rolePerms = user.adminProfile.role?.permissions.map((rp: any) => rp.permission.name) || [];
      const directPerms = user.adminProfile.permissions?.map((rp: any) => rp.permission.name) || [];
      permissions = Array.from(new Set([...rolePerms, ...directPerms]));
    }

    return NextResponse.json({ ...user, permissions });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
}
