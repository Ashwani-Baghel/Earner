import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebaseAdmin";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    const adminAuth = getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(token);

    // Verify requester is a SUPER_ADMIN
    const requester = await prisma.user.findUnique({
      where: { id: decoded.uid },
      select: { role: true },
    });

    if (!requester || requester.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Super Admin access required" }, { status: 403 });
    }

    const { email, password } = await req.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Valid email and password (min 6 chars) are required" },
        { status: 400 }
      );
    }

    // 1. Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      emailVerified: true,
      displayName: "Admin",
    });

    // 2. Add custom claims for Firebase rules if needed (optional)
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: "ADMIN" });

    // 3. Create user in Prisma DB
    const newAdmin = await prisma.user.create({
      data: {
        id: userRecord.uid,
        email: userRecord.email!,
        name: "Admin",
        role: "ADMIN",
        isVerified: true,
      },
    });

    return NextResponse.json({ success: true, user: newAdmin }, { status: 201 });
  } catch (error: any) {
    console.error("Create Admin Error:", error);
    // Handle Firebase duplicate email error specifically
    if (error.code === "auth/email-already-exists") {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
