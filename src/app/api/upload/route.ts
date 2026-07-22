import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Convert directly to a Base64 Data URI
    const mimeType = file.type || "image/jpeg";
    const base64String = buffer.toString("base64");
    const dataUri = `data:${mimeType};base64,${base64String}`;

    return NextResponse.json({ 
      success: true, 
      url: dataUri
    });
  } catch (error: any) {
    console.error("Error occurred while saving the file:", error);
    return NextResponse.json({ error: error.message || "Failed to save file." }, { status: 500 });
  }
}
