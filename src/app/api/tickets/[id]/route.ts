import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdminDb, ApiError } from "@/lib/apiAuth";

// GET a specific ticket and its messages
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const user = await requireAuth(request);

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Determine if admin
    const isAdmin = await requireAdminDb(request).then(() => true).catch(() => false);

    // If not admin, verify ownership
    if (!isAdmin && ticket.userId !== user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Filter out internal notes for non-admins
    if (!isAdmin) {
      ticket.messages = ticket.messages.filter(msg => !msg.isInternal);
    }

    // Clear userHasUnread flag if user views their ticket
    if (!isAdmin && ticket.userHasUnread) {
      await prisma.supportTicket.update({
        where: { id: params.id },
        data: { userHasUnread: false }
      });
    }

    return NextResponse.json({ ticket });
  } catch (error: any) {
    console.error("Error fetching ticket:", error);
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST a new message to a ticket
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const user = await requireAuth(request);

    const body = await request.json();
    const { message, isInternal = false } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id }
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const isAdmin = await requireAdminDb(request).then(() => true).catch(() => false);

    if (!isAdmin && ticket.userId !== user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (isInternal && !isAdmin) {
       return NextResponse.json({ error: "Only admins can add internal notes" }, { status: 403 });
    }

    const newMessage = await prisma.supportTicketMessage.create({
      data: {
        ticketId: params.id,
        senderId: user.uid,
        senderRole: isAdmin ? (isInternal ? "NOTE" : "AGENT") : "USER",
        message,
        isInternal
      }
    });

    // Update ticket status based on who replied
    await prisma.supportTicket.update({
      where: { id: params.id },
      data: {
        status: isAdmin ? (isInternal ? ticket.status : "PENDING") : "OPEN",
        userHasUnread: (isAdmin && !isInternal) ? true : ticket.userHasUnread
      }
    });

    return NextResponse.json({ message: newMessage });
  } catch (error: any) {
    console.error("Error adding message to ticket:", error);
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH to update a ticket
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const user = await requireAuth(request);

    const body = await request.json();
    const { status, priority, department, assignedTo, isArchived } = body;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id }
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const isAdmin = await requireAdminDb(request).then(() => true).catch(() => false);

    if (!isAdmin && ticket.userId !== user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only allow non-admins to update status (e.g. closing a ticket)
    const dataToUpdate: any = {};
    if (status !== undefined) dataToUpdate.status = status;
    
    if (isAdmin) {
      if (priority !== undefined) dataToUpdate.priority = priority;
      if (department !== undefined) dataToUpdate.department = department;
      if (assignedTo !== undefined) dataToUpdate.assignedTo = assignedTo;
      if (isArchived !== undefined) dataToUpdate.isArchived = isArchived;
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: params.id },
      data: dataToUpdate
    });

    return NextResponse.json({ ticket: updatedTicket });
  } catch (error: any) {
    console.error("Error updating ticket:", error);
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
