import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminDb, handleApiError } from "@/lib/apiAuth";

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { isSuper } = await requireAdminDb(req);
    if (!isSuper) {
      return NextResponse.json({ error: "Unauthorized. Super Admin required." }, { status: 403 });
    }

    const { status, assignedTo, department, priority } = await req.json();

    if (status && !["UNREAD", "READ", "REPLIED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const inquiry = await prisma.contactMessage.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(assignedTo !== undefined && { assignedTo: assignedTo === "Unassigned" ? null : assignedTo }),
        ...(department !== undefined && { department: department === "General Support" && !assignedTo ? null : department }), // Allow setting department
        ...(priority && { priority }),
      },
    });

    return NextResponse.json({ success: true, inquiry }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { isSuper } = await requireAdminDb(req);
    if (!isSuper) {
      return NextResponse.json({ error: "Unauthorized. Super Admin required." }, { status: 403 });
    }

    await prisma.contactMessage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
