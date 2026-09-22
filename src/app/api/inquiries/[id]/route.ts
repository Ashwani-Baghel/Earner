import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdminDb, ApiError } from "@/lib/apiAuth";

// GET a specific inquiry and its replies
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const user = await requireAuth(request);

    const inquiry = await prisma.contactMessage.findUnique({
      where: { id: params.id },
      include: {
        replies: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    // Determine if admin
    const isAdmin = await requireAdminDb(request).then(() => true).catch(() => false);

    // If not admin, verify ownership by email
    if (!isAdmin && inquiry.email !== user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Filter out internal notes for non-admins
    if (!isAdmin) {
      inquiry.replies = inquiry.replies.filter(msg => !msg.isInternal);
    }

    // Clear userHasUnread flag if user views their inquiry
    if (!isAdmin && inquiry.userHasUnread) {
      await prisma.contactMessage.update({
        where: { id: params.id },
        data: { userHasUnread: false }
      });
    }

    return NextResponse.json({ inquiry });
  } catch (error: any) {
    console.error("Error fetching inquiry:", error);
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST a new reply to an inquiry
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const user = await requireAuth(request);

    const body = await request.json();
    const { message, isInternal = false, attachments = [] } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const inquiry = await prisma.contactMessage.findUnique({
      where: { id: params.id }
    });

    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    const isAdmin = await requireAdminDb(request).then(() => true).catch(() => false);

    if (!isAdmin && inquiry.email !== user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (isInternal && !isAdmin) {
       return NextResponse.json({ error: "Only admins can add internal notes" }, { status: 403 });
    }

    const newReply = await prisma.contactMessageReply.create({
      data: {
        inquiryId: params.id,
        senderId: user.uid,
        senderRole: isAdmin ? (isInternal ? "NOTE" : "AGENT") : "USER",
        message,
        attachments: Array.isArray(attachments) ? attachments : [],
        isInternal
      }
    });

    // Update status and updatedAt on the inquiry
    await prisma.contactMessage.update({
      where: { id: params.id },
      data: {
        status: isAdmin ? (isInternal ? inquiry.status : "REPLIED") : "READ", // Or whatever logic you prefer
        userHasUnread: (isAdmin && !isInternal) ? true : inquiry.userHasUnread,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ reply: newReply });
  } catch (error: any) {
    console.error("Error adding reply to inquiry:", error);
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
