import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import * as admin from 'firebase-admin';

async function test() {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n"),
      }),
    });

    const storage = admin.storage();
    console.log("Attempting to create bucket...");
    const [bucket] = await storage.createBucket("earner-40c91.appspot.com", {
      location: 'US',
    });
    console.log("Bucket created:", bucket.name);
    
  } catch (error) {
    console.error('Failed to create bucket:', error);
  }
}

test();
