import { initializeApp, getApps, getApp, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let adminApp: App | undefined;
let firestoreDb: Firestore | undefined;
let authInstance: Auth | undefined;

export function getFirebaseAdmin(): {
  app: App | null;
  db: Firestore | null;
  auth: Auth | null;
  isConfigured: boolean;
} {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  const isConfigured = Boolean(projectId && clientEmail && privateKey);

  if (!isConfigured) {
    return {
      app: null,
      db: null,
      auth: null,
      isConfigured: false,
    };
  }

  try {
    if (!getApps().length) {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      adminApp = getApp();
    }

    if (!firestoreDb) firestoreDb = getFirestore(adminApp);
    if (!authInstance) authInstance = getAuth(adminApp);

    return {
      app: adminApp,
      db: firestoreDb,
      auth: authInstance,
      isConfigured: true,
    };
  } catch (error) {
    console.error("Firebase Admin initialization error:", error);
    return {
      app: null,
      db: null,
      auth: null,
      isConfigured: false,
    };
  }
}
