import { getFirebaseAdmin } from "@/lib/firebase/admin";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export interface AdminUserRecord {
  id: string;
  email: string;
  passwordHash: string; // Encrypted as <salt>:<scryptHash>
  role: "admin";
  name?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

const COLLECTION_NAME = "admin_users";

// In-memory fallback if Firestore is temporarily offline
let memoryAdminUsers: AdminUserRecord[] | null = null;

function getInitialAdminUsers(): AdminUserRecord[] {
  const defaultPassword = process.env.ADMIN_PASSWORD || "oddbox2026";
  const defaultHash = hashPassword(defaultPassword);
  const now = new Date().toISOString();

  return [
    {
      id: "admin-oddbox-primary",
      email: (process.env.ADMIN_EMAIL || "hello@oddboxstudio.in").toLowerCase(),
      passwordHash: defaultHash,
      role: "admin",
      name: "Oddbox Studio Admin",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "admin-oddbox-secondary",
      email: "admin@oddboxstudio.in",
      passwordHash: defaultHash,
      role: "admin",
      name: "Studio Administrator",
      createdAt: now,
      updatedAt: now,
    },
  ];
}

/**
 * Fetch an admin user by email (case-insensitive)
 */
export async function getAdminUserByEmail(email: string): Promise<AdminUserRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const { db, isConfigured } = getFirebaseAdmin();

  if (isConfigured && db) {
    try {
      const snapshot = await db
        .collection(COLLECTION_NAME)
        .where("email", "==", normalizedEmail)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as AdminUserRecord;
      }
    } catch (err) {
      console.warn("Firestore getAdminUserByEmail fallback:", err);
    }
  }

  if (!memoryAdminUsers) {
    memoryAdminUsers = getInitialAdminUsers();
  }

  return memoryAdminUsers.find((u) => u.email.toLowerCase() === normalizedEmail) || null;
}

/**
 * Create or save an admin user in the database with an encrypted password hash
 */
export async function saveAdminUser(
  email: string,
  plainPassword: string,
  name?: string
): Promise<AdminUserRecord> {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = hashPassword(plainPassword);
  const now = new Date().toISOString();

  const user: AdminUserRecord = {
    id: `admin-${Date.now()}`,
    email: normalizedEmail,
    passwordHash, // Stored encrypted in DB
    role: "admin",
    name: name || "Studio Administrator",
    createdAt: now,
    updatedAt: now,
  };

  const { db, isConfigured } = getFirebaseAdmin();
  if (isConfigured && db) {
    try {
      await db.collection(COLLECTION_NAME).doc(user.id).set(user);
    } catch (err) {
      console.error("Firestore saveAdminUser failed:", err);
    }
  }

  if (!memoryAdminUsers) {
    memoryAdminUsers = getInitialAdminUsers();
  }
  const idx = memoryAdminUsers.findIndex((u) => u.email.toLowerCase() === normalizedEmail);
  if (idx >= 0) {
    memoryAdminUsers[idx] = user;
  } else {
    memoryAdminUsers.push(user);
  }

  return user;
}

/**
 * Update an existing admin user's password (encrypts before saving)
 */
export async function updateAdminUserPassword(
  email: string,
  newPlainPassword: string
): Promise<boolean> {
  const user = await getAdminUserByEmail(email);
  if (!user) return false;

  const newHash = hashPassword(newPlainPassword);
  const now = new Date().toISOString();
  const updatedUser: AdminUserRecord = {
    ...user,
    passwordHash: newHash,
    updatedAt: now,
  };

  const { db, isConfigured } = getFirebaseAdmin();
  if (isConfigured && db) {
    try {
      await db.collection(COLLECTION_NAME).doc(user.id).set(updatedUser, { merge: true });
    } catch (err) {
      console.error("Firestore updateAdminUserPassword failed:", err);
    }
  }

  if (!memoryAdminUsers) {
    memoryAdminUsers = getInitialAdminUsers();
  }
  const idx = memoryAdminUsers.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (idx >= 0) {
    memoryAdminUsers[idx] = updatedUser;
  }

  return true;
}

/**
 * Verify login credentials against stored encrypted hash in DB
 */
export async function verifyAdminCredentials(
  email: string,
  plainPassword: string
): Promise<AdminUserRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();
  let user = await getAdminUserByEmail(normalizedEmail);

  // Auto-seed default admin if database is currently empty
  if (!user) {
    const defaultEmail = (process.env.ADMIN_EMAIL || "hello@oddboxstudio.in").toLowerCase();
    if (normalizedEmail === defaultEmail || normalizedEmail === "admin@oddboxstudio.in") {
      const defaultPassword = process.env.ADMIN_PASSWORD || "oddbox2026";
      user = await saveAdminUser(normalizedEmail, defaultPassword, "Oddbox Studio Admin");
    }
  }

  if (!user || !user.passwordHash) {
    return null;
  }

  const isValid = verifyPassword(plainPassword, user.passwordHash);
  if (!isValid) {
    return null;
  }

  // Record last login time
  const now = new Date().toISOString();
  user.lastLoginAt = now;

  const { db, isConfigured } = getFirebaseAdmin();
  if (isConfigured && db) {
    try {
      await db
        .collection(COLLECTION_NAME)
        .doc(user.id)
        .set({ lastLoginAt: now }, { merge: true });
    } catch {}
  }

  return user;
}

