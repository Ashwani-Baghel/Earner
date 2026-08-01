/**
 * API Authentication helpers — server-side only.
 * Updated to support SUPER_ADMIN role.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./firebaseAdmin";
import { prisma } from "@/lib/prisma";
import type { DecodedIdToken } from "firebase-admin/auth";

export type DecodedToken = DecodedIdToken;
export type AdminRole = "ADMIN" | "SUPER_ADMIN";

/** Extract and verify Firebase JWT from the Authorization header.
 *  Throws ApiError(401) if missing or invalid. */
export async function requireAuth(req: NextRequest): Promise<DecodedToken> {
  try {
    return await verifyToken(req);
  } catch {
    throw new ApiError(401, "Unauthorized. Please sign in.");
  }
}

/** Verify JWT AND check that the user has the given role in the DB.
 *  Fetches role from DB — never trusts the caller-supplied value.
 *  Throws ApiError(403) if the role does not match. */
export async function requireRole(
  req: NextRequest,
  role: "BUYER" | "SELLER" | "ADMIN" | "SUPER_ADMIN"
): Promise<DecodedToken> {
  const decoded = await requireAuth(req);
  const user = await prisma.user.findUnique({ where: { id: decoded.uid } });
  if (!user || String(user.role) !== role) {
    throw new ApiError(403, `Access denied. This endpoint requires role: ${role}`);
  }
  return decoded;
}

/** Verify the user is ADMIN or SUPER_ADMIN (DB check). */
export async function requireAdminDb(req: NextRequest): Promise<{ decoded: DecodedToken; isSuper: boolean }> {
  const decoded = await requireAuth(req);
  const user = await prisma.user.findUnique({ where: { id: decoded.uid } });
  const role = String(user?.role ?? "");
  if (!user || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    throw new ApiError(403, "Access denied. Admin privileges required.");
  }
  if (user.isBanned) {
    throw new ApiError(403, "Your account has been banned.");
  }
  return { decoded, isSuper: role === "SUPER_ADMIN" };
}

/** 
 * Verify the user has a specific permission via RBAC.
 * SUPER_ADMIN has implicit full access to everything.
 * ADMIN must have the specific permission in their AdminProfile role.
 */
export async function requirePermission(
  req: NextRequest,
  permissionName: string
): Promise<{ decoded: DecodedToken; isSuper: boolean }> {
  const decoded = await requireAuth(req);
  const user = await prisma.user.findUnique({ 
    where: { id: decoded.uid },
    include: {
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
    }
  });

  const role = String(user?.role ?? "");
  
  if (!user || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    throw new ApiError(403, "Access denied. Admin privileges required.");
  }
  if (user.isBanned) {
    throw new ApiError(403, "Your account has been banned.");
  }

  // Super Admin bypasses all specific permission checks
  if (role === "SUPER_ADMIN") {
    return { decoded, isSuper: true };
  }

  // Admin must have an active profile
  if (!user.adminProfile?.isActive) {
    throw new ApiError(403, "Your admin profile is inactive or suspended.");
  }

  // Merge role permissions and direct permissions
  const rolePerms = user.adminProfile?.role?.permissions || [];
  const directPerms = user.adminProfile?.permissions || [];
  const assignedPermissions = [...rolePerms, ...directPerms];
  const hasPerm = assignedPermissions.some((rp: any) => rp.permission.name === permissionName);

  if (!hasPerm) {
    throw new ApiError(403, `Access denied. Requires permission: ${permissionName}`);
  }

  return { decoded, isSuper: false };
}

/** Structured API error that carries an HTTP status code. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Convert any thrown value into a proper JSON error response. */
export function handleApiError(e: unknown): NextResponse {
  if (e instanceof ApiError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  const msg = e instanceof Error ? e.message : "Internal server error";
  const safeMsg =
    process.env.NODE_ENV === "development" ? msg : "Internal server error";
  console.error("[API Error]", msg);
  return NextResponse.json({ error: safeMsg }, { status: 500 });
}
