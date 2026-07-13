import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // The exact structure of this payload depends on your Custom Payment API's Webhook documentation.
    // We assume it sends something like: { orderId: "ORD_...", status: "success", txnId: "TXN..." }
    const { orderId, status, txnId } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    // Verify if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // If payment was successful
    if (status === "success" || status === "COMPLETED" || status === "PAID") {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "ACTIVE", // Mark as ACTIVE meaning the seller can start working
          // You could also store txnId in a transaction table or order metadata if you had a field for it
        }
      });
      console.log(`Payment Webhook: Order ${orderId} marked as ACTIVE (Txn: ${txnId})`);
    } else if (status === "failed" || status === "CANCELLED") {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED"
        }
      });
      console.log(`Payment Webhook: Order ${orderId} marked as CANCELLED`);
    }

    // Always respond with a 200 OK so the payment gateway knows we received the webhook
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Payment Webhook Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
