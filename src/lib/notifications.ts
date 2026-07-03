import { getAdminAuth } from "./firebaseAdmin";
import * as admin from "firebase-admin";

export async function createNotification(recipientId: string, message: string) {
  try {
    // Ensure Firebase admin is initialized
    getAdminAuth();
    const db = admin.firestore();
    
    await db.collection("notifications").add({
      recipientId,
      message,
      read: false,
      createdAt: Date.now()
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}
