import * as admin from "firebase-admin";
import { NextRequest } from "next/server";

// Initialize Firebase Admin lazily to prevent Next.js build errors
export function getAdminAuth() {
  if (!admin.apps.length) {
    try {
      if (
        process.env.FIREBASE_ADMIN_PROJECT_ID &&
        process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
        process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            // Next.js replaces \n in env vars — restore actual newlines
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
          }),
        });
      } else {
        console.warn("Firebase Admin environment variables missing. Initialization skipped.");
      }
    } catch (error) {
      console.warn("Firebase Admin initialization error:", error);
    }
  }
  return admin.auth();
}

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
    return await getAdminAuth().verifyIdToken(token);
  } catch {
    throw new Error("Invalid or expired Firebase token");
  }
}