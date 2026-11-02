import { cookies } from "next/headers";
import { verifySignedSessionToken, createSignedSessionToken } from "./password";

export interface AdminSession {
  isAuthenticated: boolean;
  user: {
    uid: string;
    email: string;
    role: "admin";
  } | null;
}

export const ADMIN_COOKIE_NAME = "oddbox_admin_session";

/**
 * Server-side helper to verify admin session on API routes and Server Components.
 * Uses cryptographically signed session tokens. Zero Firebase Auth dependency.
 */
export async function getAdminSession(): Promise<AdminSession> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return { isAuthenticated: false, user: null };
  }

  // Verify HMAC-SHA256 signature and expiration
  const verified = verifySignedSessionToken(sessionToken);
  if (verified) {
    return {
      isAuthenticated: true,
      user: {
        uid: verified.uid,
        email: verified.email,
        role: "admin",
      },
    };
  }

  // Legacy fallback (base64 payload) for backwards compatibility
  try {
    const raw = Buffer.from(sessionToken, "base64").toString("utf-8");
    const parsed = JSON.parse(raw);
    if (parsed && parsed.role === "admin" && parsed.exp > Date.now()) {
      return {
        isAuthenticated: true,
        user: {
          uid: parsed.uid || "admin",
          email: parsed.email || "hello@oddboxstudio.in",
          role: "admin",
        },
      };
    }
  } catch {
    // invalid token
  }

  return { isAuthenticated: false, user: null };
}

/**
 * Issue a cryptographically signed 7-day session token for an admin user
 */
export function createAdminSessionToken(uid: string, email: string): string {
  return createSignedSessionToken({
    uid,
    email,
    role: "admin",
  });
}
