import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError, ApiError } from "@/lib/apiAuth";

export async function PUT(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);
    const body = await req.json() as {
      name?: string;
      tagline?: string;
      bio?: string;
      skills?: string[];
      languages?: string[];
      website?: string;
      linkedin?: string;
      github?: string;
      twitter?: string;
      occupations?: any[];
      structuredSkills?: any[];
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
        occupations: body.occupations ? JSON.parse(JSON.stringify(body.occupations)) : undefined,
        structuredSkills: body.structuredSkills ? JSON.parse(JSON.stringify(body.structuredSkills)) : undefined,
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
        occupations: body.occupations ? JSON.parse(JSON.stringify(body.occupations)) : undefined,
        structuredSkills: body.structuredSkills ? JSON.parse(JSON.stringify(body.structuredSkills)) : undefined,
      }
    });

    if (body.name) {
      await prisma.user.update({
        where: { id: decoded.uid },
        data: { name: body.name }
      });
    }

    return NextResponse.json(updatedProfile);
  } catch (e) {
    return handleApiError(e);
  }
}
