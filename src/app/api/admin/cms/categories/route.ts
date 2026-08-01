import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, handleApiError, ApiError } from "@/lib/apiAuth";
import { revalidateTag, revalidatePath } from "next/cache";

// GET all categories and subcategories
export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, "categories.manage");
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        subcategories: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    return NextResponse.json(categories);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requirePermission(req, "categories.manage");
    const body = await req.json();
    const { type, name, slug, description, groupName, categoryId, featured, status, sortOrder } = body;

    if (!name || !slug) throw new ApiError(400, "Name and slug are required.");

    if (type === "subcategory") {
      if (!categoryId) throw new ApiError(400, "categoryId is required for subcategory.");
      const sub = await prisma.subCategory.create({
        data: { name, slug, description, groupName, categoryId, featured: !!featured, status: status || "ACTIVE", sortOrder: sortOrder ? Number(sortOrder) : 0 }
      });
      revalidateTag('cms-categories', 'max');
    revalidatePath('/', 'layout');
      return NextResponse.json(sub, { status: 201 });
    } else {
      const cat = await prisma.category.create({
        data: { name, slug, description, featured: !!featured, status: status || "ACTIVE", sortOrder: sortOrder ? Number(sortOrder) : 0 }
      });
      revalidateTag('cms-categories', 'max');
      revalidatePath('/', 'layout');
      return NextResponse.json(cat, { status: 201 });
    }
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requirePermission(req, "categories.manage");
    const body = await req.json();
    const { id, type, name, slug, description, groupName, categoryId, featured, status, sortOrder } = body;

    if (!id) throw new ApiError(400, "ID is required.");

    if (type === "subcategory") {
      const sub = await prisma.subCategory.update({
        where: { id },
        data: { name, slug, description, categoryId, featured, status, sortOrder: sortOrder ? Number(sortOrder) : undefined }
      });
      revalidateTag('cms-categories', 'max');
    revalidatePath('/', 'layout');
      return NextResponse.json(sub);
    } else {
      const cat = await prisma.category.update({
        where: { id },
        data: { name, slug, description, featured, status, sortOrder: sortOrder ? Number(sortOrder) : undefined }
      });
      revalidateTag('cms-categories', 'max');
      revalidatePath('/', 'layout');
      return NextResponse.json(cat);
    }
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requirePermission(req, "categories.manage");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) throw new ApiError(400, "id and type are required");

    if (type === "subcategory") {
      await prisma.subCategory.delete({ where: { id } });
    } else {
      await prisma.category.delete({ where: { id } });
    }
    
    revalidateTag('cms-categories', 'max');
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
