import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, ApiError } from "@/lib/apiAuth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: user.uid },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { messages: true }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { senderRole: true }
        }
      }
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error("Error fetching tickets:", error);
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const body = await request.json();
    const { subject, department, message, attachments = [] } = body;

    if (!subject || !department || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create ticket and initial message in a transaction
    const ticket = await prisma.$transaction(async (tx) => {
      const newTicket = await tx.supportTicket.create({
        data: {
          userId: user.uid,
          subject,
          department,
          status: "OPEN",
          priority: "MEDIUM"
        }
      });

      await tx.supportTicketMessage.create({
        data: {
          ticketId: newTicket.id,
          senderId: user.uid,
          senderRole: "USER",
          message,
          attachments: Array.isArray(attachments) ? attachments : []
        }
      });

      // Automated system reply
      await tx.supportTicketMessage.create({
        data: {
          ticketId: newTicket.id,
          senderId: "SYSTEM",
          senderRole: "SYSTEM",
          message: "Hi there! 👋\n\nThank you for reaching out to Earner Support.\n\nWe have received your ticket and our team will review it shortly. If you have any additional information or screenshots to add, please reply to this thread.\n\nWe usually respond within 24 hours.",
          attachments: []
        }
      });

      return newTicket;
    });

    return NextResponse.json({ ticket });
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
