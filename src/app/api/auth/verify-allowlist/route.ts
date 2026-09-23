import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required", allowed: false },
        { status: 400 }
      );
    }

    const allowlistedEmail = await prisma.allowlistEmail.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (allowlistedEmail) {
      return NextResponse.json({ allowed: true });
    } else {
      return NextResponse.json({ allowed: false }, { status: 403 });
    }
  } catch (error) {
    console.error("Error verifying allowlist email:", error);
    return NextResponse.json(
      { error: "Internal server error", allowed: false },
      { status: 500 }
    );
  }
}
