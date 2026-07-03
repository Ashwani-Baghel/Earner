/**
 * GET /api/gigs  — list gigs (public, no auth required)
 * POST /api/gigs — create a gig (SELLER only, JWT required)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError, ApiError } from "@/lib/apiAuth";

export const dynamic = "force-dynamic";

// ── GET /api/gigs ─────────────────────────────────────────────────────────────
// Public — no authentication required
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const featured = searchParams.get("featured") === "true";
    const search = searchParams.get("q");
    const sort = searchParams.get("sort");
    const take = Math.min(Number(searchParams.get("limit") ?? 50), 100);
    const skip = Number(searchParams.get("offset") ?? 0);

    const isMine = searchParams.get("mine") === "true";

    let sellerId: string | undefined;
    if (isMine) {
      const decoded = await requireAuth(req);
      sellerId = decoded.uid;
    }

    const gigs = await prisma.gig.findMany({
      where: {
        ...(category
          ? {
              OR: [
                { categoryId: category },
                { category: { slug: category } },
                { category: { name: category } },
              ],
            }
          : {}),
        ...(subcategory
          ? {
              OR: [
                { subcategoryId: subcategory },
                { subcategory: { slug: subcategory } },
                { subcategory: { name: subcategory } },
              ],
            }
          : {}),
        ...(sellerId ? { sellerId } : {}),
        ...(featured ? { featured: true } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { tags: { has: search } },
                { category: { name: { contains: search, mode: "insensitive" } } },
                { subcategory: { name: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
        ...(!isMine ? { status: { in: ["ACTIVE"] } as any } : {}),
      },
      include: {
        seller: { select: { id: true, name: true, avatar: true } },
        category: true,
        subcategory: true,
        media: true,
        packages: true,
      },
      orderBy: sort === "popular" 
        ? [{ orders: "desc" }, { reviewCount: "desc" }] 
        : { createdAt: "desc" },
      take,
      skip,
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

    // Map media to images array for backwards compatibility with frontend components
    const mappedGigs = gigs.map(gig => {
      const basic = mapPackage(gig.packages.find(p => p.tier === "BASIC"));
      const standard = mapPackage(gig.packages.find(p => p.tier === "STANDARD"));
      const premium = mapPackage(gig.packages.find(p => p.tier === "PREMIUM"));

      return {
        ...gig,
        category: gig.category?.name || "Other",
        subcategory: gig.subcategory?.name || null,
        images: gig.media.sort((a, b) => a.order - b.order).map(m => m.url),
        basicPackage: basic,
        standardPackage: standard,
        premiumPackage: premium,
        packages: {
          basic,
          standard,
          premium,
        },
      };
    });

    return NextResponse.json(mappedGigs);
  } catch (e) {
    return handleApiError(e);
  }
}

// ── POST /api/gigs ────────────────────────────────────────────────────────────
// Requires auth + SELLER role
export async function POST(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);

    const dbUser = await prisma.user.findUnique({ where: { id: decoded.uid } });
    
    if (!dbUser) throw new ApiError(404, "User not found. Please complete setup first.");
    if (String(dbUser.role) !== "SELLER") {
      throw new ApiError(403, "Only sellers can create gigs. Update your role in settings.");
    }

    const body = await req.json() as any;

    if (!body.title || body.title.trim().length < 5) {
      throw new ApiError(400, "Title must be at least 5 characters.");
    }
    if (!body.categoryId) {
      throw new ApiError(400, "Category is required.");
    }

    const gig = await prisma.gig.create({
      data: {
        sellerId: decoded.uid,
        title: body.title.trim(),
        description: body.description.trim(),
        categoryId: body.categoryId,
        subcategoryId: body.subcategoryId || null,
        tags: Array.isArray(body.tags) ? body.tags.map((t: string) => t.trim()).filter(Boolean) : [],
        
        packages: {
          create: body.packages.map((pkg: any) => ({
            tier: pkg.tier,
            name: pkg.name,
            description: pkg.description,
            price: Number(pkg.price),
            deliveryDays: Number(pkg.deliveryDays),
            revisions: Number(pkg.revisions),
            features: pkg.features || []
          }))
        },
        
        faqs: {
          create: body.faqs?.map((faq: any) => ({
            question: faq.question,
            answer: faq.answer
          })) || []
        },

        requirements: {
          create: body.requirements?.map((req: any) => ({
            question: req.question,
            type: req.type,
            required: req.required,
            options: req.options || []
          })) || []
        },

        media: {
          create: body.media?.map((m: any, idx: number) => ({
            url: m.url,
            type: m.type,
            order: idx,
            isPrimary: idx === 0
          })) || []
        }
      },
      include: {
        seller: { select: { id: true, name: true, avatar: true } },
        packages: true,
        faqs: true,
        requirements: true,
        media: true
      },
    });

    return NextResponse.json(gig, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
