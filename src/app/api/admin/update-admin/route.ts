import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminDb, handleApiError, ApiError } from "@/lib/apiAuth";

export async function PATCH(req: NextRequest) {
  try {
    const { isSuper } = await requireAdminDb(req);
    if (!isSuper) {
      throw new ApiError(403, "Only SUPER_ADMIN can edit admin profiles.");
    }

    const { userId, name, roleId, permissionIds } = await req.json();
    if (!userId) {
      throw new ApiError(400, "userId is required");
    }

    // 1. Update basic user info
    if (name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name }
      });
    }

    // 2. Clear old permissions
    await prisma.adminPermission.deleteMany({
      where: { admin: { userId } }
    });

    // 3. Update AdminProfile
    const updatedAdmin = await prisma.adminProfile.upsert({
      where: { userId },
      create: {
        user: { connect: { id: userId } },
        isActive: true,
        ...(roleId ? { role: { connect: { id: roleId } } } : {}),
        permissions: {
          create: (permissionIds || []).map((pId: string) => ({
            permission: { connect: { id: pId } }
          }))
        }
      },
      update: {
        ...(roleId ? { role: { connect: { id: roleId } } } : { role: { disconnect: true } }),
        permissions: {
          deleteMany: {},
          create: (permissionIds || []).map((pId: string) => ({
            permission: { connect: { id: pId } }
          }))
        }
      }
    });

    return NextResponse.json({ success: true, updatedAdmin });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
