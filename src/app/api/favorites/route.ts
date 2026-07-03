import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError, ApiError } from "@/lib/apiAuth";

// GET all favorites for the current user
export async function GET(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    const userId = decoded.uid;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        gig: {
          include: {
            seller: true,
            packages: true,
            media: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const mapPackage = (p: any) => {
      if (!p) return null;
      return {
        name: p.name,
        description: p.description,
        price: Number(p.price),
        deliveryTime: Number(p.deliveryDays),
        revisions: Number(p.revisions),
        features: p.features || [],
      };
    };

    // Format gig exactly like the other endpoints
    const formatted = favorites.map(fav => {
      const { media, packages, ...restGig } = fav.gig;
      const images = (media || []).sort((a: any, b: any) => a.order - b.order).map((m: any) => m.url);
      
      const basic = mapPackage((packages || []).find((p: any) => p.tier === "BASIC"));
      const standard = mapPackage((packages || []).find((p: any) => p.tier === "STANDARD"));
      const premium = mapPackage((packages || []).find((p: any) => p.tier === "PREMIUM"));

      return {
        ...fav,
        gig: {
          ...restGig,
          images,
          basicPackage: basic,
          standardPackage: standard,
          premiumPackage: premium,
          packages: {
            basic,
            standard,
            premium,
          },
        }
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST to toggle favorite status
export async function POST(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    const userId = decoded.uid;

    const body = await req.json();
    const { gigId } = body;

    if (!gigId) {
      throw new ApiError(400, "gigId is required");
    }

    // Check if favorite exists
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_gigId: { userId, gigId }
      }
    });

    if (existing) {
      // Remove using deleteMany to prevent race condition errors if double clicked
      await prisma.favorite.deleteMany({
        where: { userId, gigId }
      });
      return NextResponse.json({ success: true, isFavorite: false });
    } else {
      // Add
      await prisma.favorite.create({
        data: {
          userId,
          gigId
        }
      });
      return NextResponse.json({ success: true, isFavorite: true });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
