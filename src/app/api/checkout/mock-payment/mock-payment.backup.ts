import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/firebaseAdmin";
import { addDays } from "date-fns";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    const buyerId = decoded.uid;
    
    const body = await req.json();
    const { gigId, tier, price, sellerId } = body;

    if (!gigId || !tier || !price || !sellerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if gig exists and package price is correct
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      include: { packages: true }
    });

    if (!gig) {
      return NextResponse.json({ error: "Gig not found" }, { status: 404 });
    }

    const gigPackage = gig.packages.find(p => p.tier.toLowerCase() === tier.toLowerCase());
    
    if (!gigPackage) {
      return NextResponse.json({ error: "Package tier not found" }, { status: 404 });
    }

    // --- SERVICE FEE CALCULATION (Commented out for future use) ---
    // const SERVICE_FEE_PERCENTAGE = 0.05; // 5%
    // const serviceFee = price * SERVICE_FEE_PERCENTAGE;
    // const totalAmount = price + serviceFee;
    // --------------------------------------------------------------

    // For now, totalAmount is just price
    const totalAmount = price;

    const dueDate = addDays(new Date(), gigPackage.deliveryDays || 3);

    // Create the order
    const order = await prisma.order.create({
      data: {
        gigId,
        buyerId,
        sellerId: gig.sellerId,
        packageTier: tier,
        price: totalAmount,
        status: "ACTIVE", // Skipping PENDING for mock payment
        dueDate,
        paymentIntentId: `mock_pi_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      }
    });

    // Notify seller
    await createNotification(
      gig.sellerId, 
      `You have received a new order for "${gig.title}"!`
    );

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: any) {
    console.error("Mock Payment Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
