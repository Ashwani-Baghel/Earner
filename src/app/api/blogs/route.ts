import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/apiAuth";

// GET /api/blogs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? "";
    const take = Math.min(Number(searchParams.get("limit") ?? 50), 100);
    const skip = Number(searchParams.get("offset") ?? 0);
    
    const where: any = {
      status: "PUBLISHED"
    };

    if (category) {
      where.category = category;
    }

    const blogs = await prisma.blog.findMany({
      where,
      orderBy: { publishDate: "desc" },
      take,
      skip,
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true,
        author: true,
        category: true,
        tags: true,
        publishDate: true,
        seoTitle: true,
        seoDescription: true,
      }
    });

    const total = await prisma.blog.count({ where });

    return NextResponse.json({ blogs, total });
  } catch (e) {
    return handleApiError(e);
  }
}
