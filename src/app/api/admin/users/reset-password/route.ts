import { NextRequest, NextResponse } from "next/server";
import { requireAdminDb } from "@/lib/apiAuth";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { isSuper } = await requireAdminDb(req);
    if (!isSuper) {
      return NextResponse.json({ error: "Unauthorized. Super Admin required." }, { status: 403 });
    }

    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    // Update password via Firebase Admin SDK
    await getAdminAuth().updateUser(userId, {
      password: newPassword,
    });

    return NextResponse.json({ success: true, message: "Password updated successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ error: error.message || "Failed to reset password." }, { status: 500 });
  }
}
