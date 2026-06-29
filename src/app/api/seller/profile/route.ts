import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError, ApiError } from "@/lib/apiAuth";

export async function PUT(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    const body = await req.json() as {
      tagline?: string;
      bio?: string;
      skills?: string[];
      languages?: string[];
      website?: string;
      linkedin?: string;
      github?: string;
      twitter?: string;
    };

    const user = await prisma.user.findUnique({ where: { id: decoded.uid } });
    if (!user || user.role !== "SELLER") {
      throw new ApiError(403, "Only sellers can update their seller profile");
    }

    const updatedProfile = await prisma.sellerProfile.upsert({
      where: { userId: decoded.uid },
      create: {
        userId: decoded.uid,
        tagline: body.tagline,
        bio: body.bio,
        skills: body.skills,
        languages: body.languages,
        website: body.website,
        linkedin: body.linkedin,
        github: body.github,
        twitter: body.twitter,
      },
      update: {
        tagline: body.tagline,
        bio: body.bio,
        skills: body.skills,
        languages: body.languages,
        website: body.website,
        linkedin: body.linkedin,
        github: body.github,
        twitter: body.twitter,
      }
    });

    return NextResponse.json(updatedProfile);
  } catch (e) {
    return handleApiError(e);
  }
}
