import * as admin from "firebase-admin";
import { NextRequest } from "next/server";

// Initialize Firebase Admin (singleton)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      // Next.js replaces \n in env vars — restore actual newlines
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const adminAuth = admin.auth();

/**
 * Verify the Firebase ID token from an Authorization header.
 * Returns the decoded token (uid, email, etc.) or throws a 401 error.
 */
export async function verifyToken(req: NextRequest): Promise<admin.auth.DecodedIdToken> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    throw new Error("Invalid or expired Firebase token");
  }
}