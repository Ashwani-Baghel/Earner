import { NextRequest, NextResponse } from "next/server";
import { requireAdminDb } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";

// Get active and pending orders eligible for refund
export async function GET(req: NextRequest) {
  try {
    await requireAdminDb(req);
    
    // As per user instruction, no need to refund COMPLETED orders.
    // So we fetch PENDING and ACTIVE orders.
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ["PENDING", "ACTIVE"] }
      },
      orderBy: { createdAt: "desc" },
      include: {
        gig: { select: { title: true } },
        buyer: { select: { name: true, email: true } },
        seller: { select: { name: true } },
      },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Fetch refund eligible orders error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: error.status || 500 }
    );
  }
}

// Process a refund
export async function POST(req: NextRequest) {
  try {
    await requireAdminDb(req);
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId }
      });

      if (!order) throw new Error("Order not found");
      
      if (order.status === "REFUNDED" || order.status === "CANCELLED") {
        throw new Error(`Order is already ${order.status.toLowerCase()}`);
      }
      
      if (order.status === "COMPLETED") {
        throw new Error("Cannot refund a completed order");
      }

      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "REFUNDED" },
      });

      // Log the REFUND transaction
      const refundTx = await tx.transaction.create({
        data: {
          amount: order.price,
          type: "REFUND",
          status: "COMPLETED",
          userId: order.buyerId,
          orderId: order.id,
          description: `Refund processed for order ${order.id}`,
        }
      });

      return { order: updatedOrder, refundTx };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Process refund error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process refund" },
      { status: error.status || 500 }
    );
  }
}
