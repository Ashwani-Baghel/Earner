import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../lib/apiAuth";
import { prisma } from "../../../lib/prisma";
import type { Gig, PackageTier, GigPackage } from "../../../lib/types";

// GET: Fetch all cart items for the logged in user
export async function GET(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    const userId = decoded.uid;

    const dbItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        gig: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                avatar: true,
              }
            },
            packages: true,
          }
        }
      }
    });

    // Transform DB items back into the shape CartContext expects
    const formattedItems = dbItems.map(item => {
      // Reconstruct the Gig structure
      const packagesMap: Record<string, GigPackage> = {};
      item.gig.packages.forEach((pkg: any) => {
        packagesMap[pkg.tier] = {
          price: pkg.price,
          deliveryTime: pkg.deliveryDays,
          revisions: pkg.revisions,
          features: pkg.features,
        } as GigPackage;
      });

      const gig: Gig = {
        id: item.gig.id,
        title: item.gig.title,
        description: item.gig.description,
        images: item.gig.images,
        categoryId: item.gig.categoryId,
        subcategoryId: item.gig.subcategoryId,
        sellerId: item.gig.sellerId,
        seller: item.gig.seller,
        packages: packagesMap,
        createdAt: item.gig.createdAt.toISOString(),
      };

      return {
        gig,
        tier: item.tier as PackageTier,
        pkg: packagesMap[item.tier],
        quantity: 1, // Currently fixed at 1
      };
    });

    return NextResponse.json({ success: true, items: formattedItems });
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Cart GET error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// POST: Add or merge items into the user's cart
export async function POST(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    const userId = decoded.uid;
    const body = await req.json();
    
    // body can be a single item { gigId, tier } or an array of items [{ gigId, tier }]
    const itemsToAdd = Array.isArray(body.items) ? body.items : [body];

    if (itemsToAdd.length === 0) {
      return NextResponse.json({ success: true, message: "Nothing to add" });
    }

    // Insert all items ignoring duplicates (Prisma doesn't have createMany ignore duplicates natively in standard PostgreSQL without unsupported features, so we loop)
    for (const item of itemsToAdd) {
      if (!item.gigId || !item.tier) continue;
      
      await prisma.cartItem.upsert({
        where: {
          userId_gigId_tier: {
            userId,
            gigId: item.gigId,
            tier: item.tier,
          }
        },
        update: {}, // Do nothing if it exists
        create: {
          userId,
          gigId: item.gigId,
          tier: item.tier,
        }
      });
    }

    return NextResponse.json({ success: true, message: "Added to cart" });
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Cart POST error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// DELETE: Remove an item from the cart or clear entirely
export async function DELETE(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    const userId = decoded.uid;
    const { searchParams } = new URL(req.url);
    const gigId = searchParams.get("gigId");
    const clearAll = searchParams.get("clearAll") === "true";

    if (clearAll) {
      await prisma.cartItem.deleteMany({
        where: { userId }
      });
      return NextResponse.json({ success: true, message: "Cart cleared" });
    }

    if (!gigId) {
      return NextResponse.json({ error: "Missing gigId" }, { status: 400 });
    }

    await prisma.cartItem.deleteMany({
      where: {
        userId,
        gigId,
      }
    });

    return NextResponse.json({ success: true, message: "Removed from cart" });
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    console.error("Cart DELETE error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
