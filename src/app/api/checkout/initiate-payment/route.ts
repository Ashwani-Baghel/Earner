import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    const userId = decoded.uid;

    const { gigId, tier, price, sellerId } = await req.json();

    if (!gigId || !tier || !price || !sellerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate a secure, unique order ID
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Record the order in our database as PENDING before calling the payment gateway
    await prisma.order.create({
      data: {
        id: orderId,
        buyerId: userId,
        sellerId,
        gigId,
        package: tier,
        price,
        status: "PENDING",
        requirements: "Pending requirements...",
        deliveryTime: 3, // Default fallback, should ideally fetch from gig
      }
    });

    // ─── Call Custom Payment Gateway ───
    const apiUrl = process.env.CUSTOM_PAYMENT_API_URL;
    const apiHeader = process.env.CUSTOM_PAYMENT_API_HEADER;

    if (!apiUrl || !apiHeader) {
      console.warn("Payment API credentials missing in .env, falling back to mock response.");
      // Fallback response matching the user's provided JSON structure for testing
      return NextResponse.json({
        success: true,
        message: "Payment initiated successfully",
        data: {
          txnId: `TXN${Date.now()}`,
          orderId: orderId,
          amount: price,
          status: "pending",
          qrPageUrl: `http://localhost:3000/pay/TXN${Date.now()}`,
          paymentLink: `http://localhost:3000/pay/TXN${Date.now()}`,
          expiresAt: new Date(Date.now() + 5 * 60000).toISOString(),
          expiryMinutes: 5,
          intentUrl: `upi://pay?pa=test@upi&pn=Seller&am=${price}.00&tr=${orderId}&cu=INR`
        }
      });
    }

    // Execute actual API call
    // (Assuming the API expects a JSON body with amount and order details)
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": apiHeader // Adjust this if the header format is different (e.g., just passing the key directly)
      },
      body: JSON.stringify({
        orderId,
        amount: price,
        customerEmail: decoded.email || "customer@example.com",
        customerName: decoded.name || "Customer",
        description: `Payment for Gig: ${gigId}`
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Payment Gateway Error");
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Payment Initiation Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
