import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * BankLinkr Webhook Handler
 * This endpoint is called by BankLinkr when a payment status changes.
 * Configure this URL in your BankLinkr merchant dashboard as the callback URL:
 *   https://yourdomain.com/api/webhooks/banklinkr
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    console.log("📩 BankLinkr Webhook received:", JSON.stringify(payload, null, 2));

    // ─── Optional: Verify webhook signature ──────────────────────────────────
    // If BankLinkr sends a signature header, you should verify it here:
    // const signature = req.headers.get("x-banklinkr-signature");
    // if (!verifySignature(payload, signature)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    const { txnId, status, orderId, amount } = payload?.data || payload || {};

    if (!txnId || !status) {
      console.error("Webhook: Missing txnId or status in payload.");
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    // ─── Find the order by txnId (paymentIntentId) ───────────────────────────
    const order = await prisma.order.findFirst({
      where: { paymentIntentId: txnId }
    });

    if (!order) {
      // Might be a duplicate or old event — return 200 to prevent BankLinkr from retrying
      console.warn(`Webhook: Order not found for txnId ${txnId}. Possibly already processed.`);
      return NextResponse.json({ received: true });
    }

    // ─── Map BankLinkr status to our OrderStatus ─────────────────────────────
    let newOrderStatus: string | null = null;

    if (status === "success" || status === "paid" || status === "completed") {
      newOrderStatus = "ACTIVE"; // Payment confirmed, gig work can begin
    } else if (status === "failed" || status === "expired") {
      newOrderStatus = "CANCELLED";
    } else if (status === "refunded") {
      newOrderStatus = "REFUNDED";
    }

    if (newOrderStatus && order.status !== newOrderStatus) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: newOrderStatus as any }
      });

      console.log(`✅ Order ${order.id} updated to ${newOrderStatus} via BankLinkr webhook.`);
    } else {
      console.log(`ℹ️  Webhook: Order ${order.id} already at status ${order.status}. No update needed.`);
    }

    // ─── Always respond 200 OK to acknowledge receipt ────────────────────────
    return NextResponse.json({ received: true, orderId: order.id, status: newOrderStatus });

  } catch (error: any) {
    console.error("❌ Webhook Error:", error);
    // Return 200 even on error to prevent BankLinkr from retrying infinitely
    return NextResponse.json({ received: true, warning: "Internal processing error" }, { status: 200 });
  }
}
