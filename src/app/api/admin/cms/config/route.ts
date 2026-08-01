import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, handleApiError, ApiError } from "@/lib/apiAuth";
import { revalidateTag, revalidatePath } from "next/cache";

// GET a specific CMS config by key
export async function GET(req: NextRequest) {
  try {
    await requirePermission(req, "content.manage");
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) throw new ApiError(400, "key is required");

    const config = await prisma.cmsConfig.findUnique({
      where: { key }
    });

    return NextResponse.json(config ? config.data : {});
  } catch (e) {
    return handleApiError(e);
  }
}

// UPSERT a CMS config by key
export async function POST(req: NextRequest) {
  try {
    await requirePermission(req, "content.manage");
    const body = await req.json();
    const { key, data } = body;

    if (!key || !data) throw new ApiError(400, "key and data are required");

    const config = await prisma.cmsConfig.upsert({
      where: { key },
      update: { data },
      create: { key, data }
    });

    // Bust Next.js cache so changes are immediately visible on the frontend
    revalidateTag('cms-config', 'max');
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, data: config.data });
  } catch (e) {
    return handleApiError(e);
  }
}
