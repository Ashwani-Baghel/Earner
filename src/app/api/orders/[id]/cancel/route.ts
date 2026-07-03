import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError, ApiError } from "@/lib/apiAuth";
import { createNotification } from "@/lib/notifications";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = await requireAuth(req);
    const orderId = (await params).id;

    if (!orderId) {
      throw new ApiError(400, "Order ID is required");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    // Must be the buyer
    if (order.buyerId !== decoded.uid) {
      throw new ApiError(403, "Only the buyer can cancel this order.");
    }

    // Must be PENDING or ACTIVE
    if (order.status !== "PENDING" && order.status !== "ACTIVE") {
      throw new ApiError(400, "This order cannot be cancelled anymore.");
    }

    // Check if within 3 hours
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    if (order.createdAt < threeHoursAgo) {
      throw new ApiError(400, "Orders can only be cancelled within 3 hours of placement.");
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" }
    });

    // Notify seller
    await createNotification(
      order.sellerId,
      `Order #${order.id.slice(-5)} has been cancelled by the buyer.`
    );

    return NextResponse.json(updatedOrder);
  } catch (e) {
    return handleApiError(e);
  }
}
