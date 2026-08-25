import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, ApiError } from "@/lib/apiAuth";

// GET /api/blogs/[slug]
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const blog = await prisma.blog.findUnique({
      where: { slug: params.slug }
    });

    if (!blog) {
      throw new ApiError(404, "Blog not found.");
    }

    if (blog.status !== "PUBLISHED") {
      throw new ApiError(403, "This blog is not published yet.");
    }

    return NextResponse.json({ blog });
  } catch (e) {
    return handleApiError(e);
  }
}
