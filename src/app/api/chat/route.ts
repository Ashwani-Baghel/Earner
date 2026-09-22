import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdminDb, ApiError } from "@/lib/apiAuth";

// GET active chat session and messages
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Admins need a different endpoint or query params to fetch user chats, 
    // this endpoint is primarily for the user side.
    const session = await prisma.liveChatSession.findFirst({
      where: { 
        userId: user.uid,
        status: { in: ["WAITING", "ACTIVE"] }
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" }
        }
      }
    });

    return NextResponse.json({ session });
  } catch (error: any) {
    console.error("Error fetching chat session:", error);
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
    const { action, message, sessionId } = body;

    // Start a new session
    if (action === "START") {
      // check if one already exists
      const existing = await prisma.liveChatSession.findFirst({
        where: { userId: user.uid, status: { in: ["WAITING", "ACTIVE"] } }
      });
      if (existing) {
        return NextResponse.json({ session: existing });
      }

      const newSession = await prisma.liveChatSession.create({
        data: {
          userId: user.uid,
          status: "WAITING"
        },
        include: { messages: true }
      });
      
      // Auto-reply system message
      await prisma.liveChatMessage.create({
        data: {
          sessionId: newSession.id,
          senderId: "SYSTEM",
          message: "Welcome to Live Chat! An agent will be with you shortly."
        }
      });
      
      const refreshedSession = await prisma.liveChatSession.findUnique({
        where: { id: newSession.id },
        include: { messages: { orderBy: { createdAt: "asc" } } }
      });

      return NextResponse.json({ session: refreshedSession });
    }

    // Send a message
    if (action === "MESSAGE") {
      if (!message || !sessionId) {
        return NextResponse.json({ error: "Message and sessionId are required" }, { status: 400 });
      }

      // Verify the session
      const session = await prisma.liveChatSession.findUnique({
        where: { id: sessionId }
      });

      if (!session) {
         return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      const isAdmin = await requireAdminDb(request).then(() => true).catch(() => false);
      if (!isAdmin && session.userId !== user.uid) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const newMessage = await prisma.liveChatMessage.create({
        data: {
          sessionId: session.id,
          senderId: isAdmin ? user.uid : "USER", // "USER" or actual admin UID
          message
        }
      });

      // If an admin replied, mark session as ACTIVE and assign them
      if (isAdmin && session.status === "WAITING") {
        await prisma.liveChatSession.update({
          where: { id: session.id },
          data: { status: "ACTIVE", agentId: user.uid }
        });
      }

      return NextResponse.json({ message: newMessage });
    }
    
    // Close session
    if (action === "CLOSE") {
       if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });
       
       const session = await prisma.liveChatSession.update({
         where: { id: sessionId },
         data: { status: "CLOSED", endedAt: new Date() }
       });
       return NextResponse.json({ session });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error with chat action:", error);
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
