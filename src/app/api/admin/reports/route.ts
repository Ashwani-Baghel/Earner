/**
 * GET   /api/admin/reports — list all reports
 * POST  /api/admin/reports — create a report (any authenticated user)
 * PATCH /api/admin/reports — resolve or dismiss a report (admin only)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdminDb, handleApiError, ApiError } from "@/lib/apiAuth";

export async function GET(req: NextRequest) {
  try {
    await requireAdminDb(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? "";
    const take   = Math.min(Number(searchParams.get("limit") ?? 50), 200);
    const skip   = Number(searchParams.get("offset") ?? 0);

    const where: any = {};
    if (status && ["OPEN", "RESOLVED", "DISMISSED"].includes(status)) {
      where.status = status as any;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({ reports, total });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    const body = await req.json() as {
      targetType: string;
      targetId: string;
      reason: string;
      details?: string;
    };

    const VALID_TYPES = ["USER", "GIG", "MESSAGE"];
    if (!body.targetType || !VALID_TYPES.includes(body.targetType)) {
      throw new ApiError(400, `targetType must be one of: ${VALID_TYPES.join(", ")}`);
    }
    if (!body.targetId) throw new ApiError(400, "targetId is required.");
    if (!body.reason || body.reason.trim().length < 5) {
      throw new ApiError(400, "reason must be at least 5 characters.");
    }

    const report = await prisma.report.create({
      data: {
        reporterId: decoded.uid,
        targetType: body.targetType as any,
        targetId:   body.targetId,
        reason:     body.reason.trim(),
        details:    body.details?.trim() ?? null,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { decoded } = await requireAdminDb(req);
    const { reportId, action } = await req.json() as { reportId: string; action: string };

    if (!reportId || !action) throw new ApiError(400, "reportId and action are required.");

    const statusMap: Record<string, string> = {
      resolve:  "RESOLVED",
      dismiss:  "DISMISSED",
    };
    if (!statusMap[action]) {
      throw new ApiError(400, "action must be 'resolve' or 'dismiss'.");
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: statusMap[action] as any,
        resolvedBy: decoded.uid,
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
