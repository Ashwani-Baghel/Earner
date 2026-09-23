import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminDb, handleApiError } from "@/lib/apiAuth";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export async function GET(req: NextRequest) {
  try {
    const { isSuper } = await requireAdminDb(req);
    if (!isSuper) {
      return NextResponse.json({ error: "Unauthorized. Super Admin required." }, { status: 403 });
    }

    const list = await prisma.allowlistEmail.findMany({
      orderBy: { createdAt: "desc" },
    });

    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, allowlist: list, users }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { isSuper } = await requireAdminDb(req);
    if (!isSuper) {
      return NextResponse.json({ error: "Unauthorized. Super Admin required." }, { status: 403 });
    }

    const { email, password } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const formattedEmail = email.toLowerCase().trim();

    // Check if exists in allowlist
    const existsInAllowlist = await prisma.allowlistEmail.findUnique({
      where: { email: formattedEmail },
    });

    if (existsInAllowlist) {
      return NextResponse.json({ error: "Email is already in the whitelist." }, { status: 400 });
    }

    // Try to find the user in Firebase to determine if they are existing
    let firebaseUser;
    try {
      firebaseUser = await getAdminAuth().getUserByEmail(formattedEmail);
    } catch (e: any) {
      if (e.code !== "auth/user-not-found") throw e;
    }

    if (firebaseUser) {
      // User exists. Update password.
      await getAdminAuth().updateUser(firebaseUser.uid, {
        password: password,
        emailVerified: true
      });
      // Ensure they are verified in Prisma too
      await prisma.user.update({
        where: { id: firebaseUser.uid },
        data: { isVerified: true }
      });
    } else {
      // User doesn't exist, create in Firebase
      firebaseUser = await getAdminAuth().createUser({
        email: formattedEmail,
        password: password,
        emailVerified: true,
        displayName: formattedEmail.split("@")[0]
      });

      // Create in Prisma
      await prisma.user.create({
        data: {
          id: firebaseUser.uid,
          email: formattedEmail,
          name: formattedEmail.split("@")[0],
          role: "BUYER",
          isVerified: true
        }
      });
    }

    const newEntry = await prisma.allowlistEmail.create({
      data: { email: formattedEmail },
    });

    return NextResponse.json({ success: true, entry: newEntry }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { isSuper } = await requireAdminDb(req);
    if (!isSuper) {
      return NextResponse.json({ error: "Unauthorized. Super Admin required." }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }

    await prisma.allowlistEmail.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
