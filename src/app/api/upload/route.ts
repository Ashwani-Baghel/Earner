import { NextRequest, NextResponse } from "next/server";
import { getAdminStorage } from "@/lib/firebaseAdmin";
import crypto from "crypto";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = Date.now() + "_" + file.name.replace(/\s/g, "_");

    try {
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
    } catch (firebaseError: any) {
      console.warn("Firebase upload failed, falling back to local storage:", firebaseError.message);
      
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      return NextResponse.json({ 
        success: true, 
        url: `/uploads/${filename}` 
      });
    }
  } catch (error: any) {
    console.error("Error occurred while saving the file:", error);
    return NextResponse.json({ error: error.message || "Failed to save file." }, { status: 500 });
  }
}
