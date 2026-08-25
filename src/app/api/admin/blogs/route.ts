import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminDb, handleApiError, ApiError } from "@/lib/apiAuth";

// GET /api/admin/blogs
export async function GET(req: NextRequest) {
  try {
    await requireAdminDb(req);
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") ?? "";
    const status = searchParams.get("status") ?? "";
    
    const where: any = {};
    if (q) {
      where.title = { contains: q, mode: "insensitive" };
    }
    if (status && ["DRAFT", "PUBLISHED"].includes(status)) {
      where.status = status;
    }

    const blogs = await prisma.blog.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ blogs });
  } catch (e) {
    return handleApiError(e);
  }
}

// POST /api/admin/blogs
export async function POST(req: NextRequest) {
  try {
    await requireAdminDb(req);
    const body = await req.json();
    const { 
      title, slug, content, featuredImage, author, 
      category, tags, status, publishDate, 
      seoTitle, seoDescription, ogImage 
    } = body;

    if (!title || !slug || !content || !author || !category) {
      throw new ApiError(400, "Missing required fields (title, slug, content, author, category).");
    }

    // Check slug uniqueness
    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (existing) {
      throw new ApiError(400, "A blog with this slug already exists.");
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        featuredImage,
        author,
        category,
        tags: tags || [],
        status: status || "DRAFT",
        publishDate: publishDate ? new Date(publishDate) : null,
        seoTitle,
        seoDescription,
        ogImage
      }
    });

    return NextResponse.json({ success: true, blog });
  } catch (e) {
    return handleApiError(e);
  }
}
