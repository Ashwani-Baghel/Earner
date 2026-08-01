import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminDb } from '@/lib/apiAuth';

export async function GET(req: NextRequest) {
  try {
    await requireAdminDb(req);
    const roles = await prisma.adminRole.findMany({
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { admins: true } }
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(roles);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as any).message }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { isSuper } = await requireAdminDb(req);
    if (!isSuper) throw new Error("Only SUPER_ADMIN can create roles.");

    const { name, description, permissionIds } = await req.json();
    if (!name) throw new Error("Role name is required.");

    const role = await prisma.adminRole.create({
      data: {
        name,
        description,
        permissions: {
          create: (permissionIds || []).map((pId: string) => ({
            permission: { connect: { id: pId } }
          }))
        }
      }
    });

    return NextResponse.json(role);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as any).message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { isSuper } = await requireAdminDb(req);
    if (!isSuper) throw new Error("Only SUPER_ADMIN can edit roles.");

    const { roleId, name, description, permissionIds } = await req.json();
    if (!roleId || !name) throw new Error("roleId and name are required.");

    // First delete all existing permissions for this role
    await prisma.rolePermission.deleteMany({ where: { roleId } });

    // Then update the role and add the new permissions
    const role = await prisma.adminRole.update({
      where: { id: roleId },
      data: {
        name,
        description,
        permissions: {
          create: (permissionIds || []).map((pId: string) => ({
            permission: { connect: { id: pId } }
          }))
        }
      }
    });

    return NextResponse.json(role);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as any).message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { isSuper } = await requireAdminDb(req);
    if (!isSuper) throw new Error("Only SUPER_ADMIN can delete roles.");

    const { roleId } = await req.json();
    if (!roleId) throw new Error("roleId is required.");

    await prisma.adminRole.delete({ where: { id: roleId } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as any).message }, { status: 400 });
  }
}
