import { NextRequest, NextResponse } from "next/server";
import { requireAdminDb } from "@/lib/apiAuth";
import { prisma } from "@/lib/prisma";

// Get sellers eligible for payouts (earnings > 0)
export async function GET(req: NextRequest) {
  try {
    await requireAdminDb(req);

    const sellers = await prisma.sellerProfile.findMany({
      where: { earnings: { gt: 0 } },
      orderBy: { earnings: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ sellers });
  } catch (error: any) {
    console.error("Fetch payouts error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payouts" },
      { status: error.status || 500 }
    );
  }
}

// Process a payout for a seller
export async function POST(req: NextRequest) {
  try {
    await requireAdminDb(req);
    const { sellerId, amount } = await req.json();

    if (!sellerId || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid payout request" }, { status: 400 });
    }

    // Run in a transaction to ensure atomic updates
    const result = await prisma.$transaction(async (tx) => {
      const seller = await tx.sellerProfile.findUnique({
        where: { id: sellerId },
        include: { user: true }
      });

      if (!seller) throw new Error("Seller not found");
      if (seller.earnings < amount) {
        throw new Error(`Insufficient earnings. Seller has $${seller.earnings.toFixed(2)}`);
      }

      // The user wants a 5% platform fee taken from the payout
      const platformFee = amount * 0.05;
      const actualPayout = amount - platformFee;

      // Deduct full amount from seller's earnings
      const updatedSeller = await tx.sellerProfile.update({
        where: { id: sellerId },
        data: { earnings: { decrement: amount } },
      });

      // Log the PAYOUT transaction (what goes to the seller)
      const payoutTx = await tx.transaction.create({
        data: {
          amount: actualPayout,
          type: "PAYOUT",
          status: "COMPLETED",
          userId: seller.userId,
          description: `Payout processed for $${actualPayout.toFixed(2)} (Requested: $${amount.toFixed(2)})`,
        }
      });

      // Log the PLATFORM_FEE transaction (what the platform keeps)
      if (platformFee > 0) {
        await tx.transaction.create({
          data: {
            amount: platformFee,
            type: "PLATFORM_FEE",
            status: "COMPLETED",
            userId: seller.userId,
            description: `Platform fee (5%) on payout ${payoutTx.id}`,
          }
        });
      }

      return { seller: updatedSeller, payoutTx };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Process payout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process payout" },
      { status: error.status || 500 }
    );
  }
}
