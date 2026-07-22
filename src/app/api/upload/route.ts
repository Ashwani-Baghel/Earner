import { NextRequest, NextResponse } from "next/server";
import { getAdminStorage } from "@/lib/firebaseAdmin";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = Date.now() + "_" + file.name.replace(/\s/g, "_");

    const storage = getAdminStorage();
    const bucket = storage.bucket();
    const fileRef = bucket.file(`uploads/${filename}`);

    const uuid = crypto.randomUUID();

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          firebaseStorageDownloadTokens: uuid,
        }
      },
    });

    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileRef.name)}?alt=media&token=${uuid}`;

    return NextResponse.json({ 
      success: true, 
      url
    });
  } catch (error) {
    console.error("Error occurred while saving the file.", error);
    return NextResponse.json({ error: "Failed to save file." }, { status: 500 });
  }
}
