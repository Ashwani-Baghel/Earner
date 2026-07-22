import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    const firebaseUid = decoded.uid;

    const { gigId, tier, price } = await req.json();

    if (!gigId || !tier || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // ─── Step 1: Lookup buyer and gig from database ───────────────────────────
    const buyer = await prisma.user.findUnique({
      where: { id: firebaseUid },
      select: { id: true, email: true, name: true }
    });

    if (!buyer) {
      return NextResponse.json({ error: "Buyer account not found in database" }, { status: 404 });
    }

    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      select: { sellerId: true, title: true }
    });

    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    // ─── Step 2: Create the order in the database as PENDING ─────────────────
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3);

    const order = await prisma.order.create({
      data: {
        id: orderId,
        buyerId: buyer.id,
        sellerId: gig.sellerId,
        gigId,
        packageTier: tier,
        price,
        status: "PENDING",
        requirements: "Pending requirements...",
        dueDate,
      }
    });

    // ─── Step 3: Call BankLinkr Pay-In API ───────────────────────────────────
    const apiUrl = process.env.CUSTOM_PAYMENT_API_URL;
    const apiHeader = process.env.CUSTOM_PAYMENT_API_HEADER;
    const merchantId = process.env.BANKLINKR_MERCHANT_ID;

    if (!apiUrl || !apiHeader || !merchantId) {
      // ─── Mock fallback for local development ─────────────────────────────
      console.warn("⚠️  BankLinkr credentials not configured — using mock payment response.");
      const mockTxnId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      // Convert USD price to INR for the QR / UPI intent (1 USD ≈ 83.5 INR)
      const inrAmount = Math.round(Number(price) * 83.5);
      return NextResponse.json({
        success: true,
        message: "Payment initiated successfully",
        data: {
          txnId: mockTxnId,
          orderId,
          amount: inrAmount,   // return INR amount so frontend can use it
          currency: "INR",
          status: "pending",
          paymentLink: `http://localhost:3000/pay/${mockTxnId}`,
          intentUrl: `upi://pay?pa=earner@upi&pn=Earner+Platform&am=${inrAmount}&cu=INR&tn=${encodeURIComponent(`Order for: ${(gig.title || "Gig").substring(0, 50)}`)}&tr=${orderId}&mc=7372&mode=02`,
          expiresAt: new Date(Date.now() + 10 * 60000).toISOString(),
          expiryMinutes: 10,
        }
      });
    }

    // ─── Step 3a: Build request body for BankLinkr ───────────────────────────
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payments/callback`;

    // Convert USD price to INR before sending to gateway
    const inrAmount = Math.round(Number(price) * 83.5);

    const gatewayPayload = {
      merchantId,
      orderId,
      amount: inrAmount,     // always send INR to gateway
      currency: "INR",
      customerEmail: buyer.email,
      customerName: buyer.name,
      description: `Earner: Payment for "${gig.title}" (${tier} package)`,
      callbackUrl,
    };

    const gatewayResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apiHeader,
      },
      body: JSON.stringify(gatewayPayload),
    });

    const gatewayData = await gatewayResponse.json();

    if (!gatewayResponse.ok || !gatewayData.success) {
      // If payment gateway fails, clean up the order
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" }
      });
      throw new Error(gatewayData.message || "BankLinkr API returned an error.");
    }

    // ─── Step 4: Store txnId (paymentIntentId) from BankLinkr response ───────
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentIntentId: gatewayData.data?.txnId }
    });

    // ─── Step 5: Return the payment URL and intent to the frontend ───────────
    return NextResponse.json({
      success: true,
      message: "Payment initiated successfully",
      data: gatewayData.data,
    });

  } catch (error: any) {
    console.error("❌ Payment Initiation Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
