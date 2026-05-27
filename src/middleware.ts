/**
 * middleware.ts — Edge middleware
 *
 * WHAT THIS DOES:
 *   Protects /api/admin/* API routes — returns 401 JSON if no Bearer token present.
 *
 * WHAT THIS DOES NOT DO:
 *   It does NOT redirect /admin page routes. Page-level access control is handled
 *   client-side in src/app/admin/layout.tsx via useAuth() + requireAdminDb() in
 *   each server component. This is correct because:
 *   - Browsers do NOT send Authorization headers on normal page navigation.
 *   - Firebase ID tokens are only available in JavaScript (client-side).
 *   - The layout.tsx already checks role === "ADMIN" | "SUPER_ADMIN" and
 *     redirects non-admins to "/" before rendering anything.
 *
 * ROLE CHECK:
 *   Token presence here is a lightweight first gate.
 *   The actual ADMIN role check happens server-side inside each API handler
 *   via requireAdminDb() which queries the DB directly.
 */

import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only intercept API admin routes — page routes are protected by admin/layout.tsx
  if (!pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  // For API routes: require Authorization header with a Bearer token
  const authHeader = req.headers.get("authorization");
  const hasToken   = authHeader?.startsWith("Bearer ") ?? false;

  if (!hasToken) {
    return NextResponse.json(
      { error: "Unauthorized. Authentication required." },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  // Only run on API admin routes — NOT on /admin page routes
  matcher: ["/api/admin/:path*"],
};
