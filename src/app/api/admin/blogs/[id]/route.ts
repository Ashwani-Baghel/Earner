import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminDb, handleApiError, ApiError } from "@/lib/apiAuth";

// GET /api/admin/blogs/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdminDb(req);
    const blog = await prisma.blog.findUnique({
      where: { id: params.id }
    });

    if (!blog) {
      throw new ApiError(404, "Blog not found.");
    }

    return NextResponse.json({ blog });
  } catch (e) {
    return handleApiError(e);
  }
}

// PUT /api/admin/blogs/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdminDb(req);
    const body = await req.json();
    const { 
      title, slug, content, featuredImage, author, 
      category, tags, status, publishDate, 
      seoTitle, seoDescription, ogImage 
    } = body;

    // Check if blog exists
    const existingBlog = await prisma.blog.findUnique({ where: { id: params.id } });
    if (!existingBlog) {
      throw new ApiError(404, "Blog not found.");
    }

    // Check slug uniqueness if it changed
    if (slug && slug !== existingBlog.slug) {
      const slugExists = await prisma.blog.findUnique({ where: { slug } });
      if (slugExists) {
        throw new ApiError(400, "A blog with this slug already exists.");
      }
    }

    const updatedBlog = await prisma.blog.update({
      where: { id: params.id },
      data: {
        title: title !== undefined ? title : existingBlog.title,
        slug: slug !== undefined ? slug : existingBlog.slug,
        content: content !== undefined ? content : existingBlog.content,
        featuredImage: featuredImage !== undefined ? featuredImage : existingBlog.featuredImage,
        author: author !== undefined ? author : existingBlog.author,
        category: category !== undefined ? category : existingBlog.category,
        tags: tags !== undefined ? tags : existingBlog.tags,
        status: status !== undefined ? status : existingBlog.status,
        publishDate: publishDate !== undefined ? (publishDate ? new Date(publishDate) : null) : existingBlog.publishDate,
        seoTitle: seoTitle !== undefined ? seoTitle : existingBlog.seoTitle,
        seoDescription: seoDescription !== undefined ? seoDescription : existingBlog.seoDescription,
        ogImage: ogImage !== undefined ? ogImage : existingBlog.ogImage
      }
    });

    return NextResponse.json({ success: true, blog: updatedBlog });
  } catch (e) {
    return handleApiError(e);
  }
}

// DELETE /api/admin/blogs/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdminDb(req);
    
    // Check if exists
    const existingBlog = await prisma.blog.findUnique({ where: { id: params.id } });
    if (!existingBlog) {
      throw new ApiError(404, "Blog not found.");
    }

    await prisma.blog.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
