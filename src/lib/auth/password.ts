import crypto from "crypto";

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.ADMIN_PASSWORD ||
  "oddbox-studio-secure-auth-secret-key-2026";

/**
 * Hash a plain text password using cryptographic scrypt + random salt.
 * The stored format is: `<salt>:<hash>`
 */
export function hashPassword(plainText: string): string {
  if (!plainText) {
    throw new Error("Password cannot be empty");
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(plainText, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
  }).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a plain text password against a stored `<salt>:<hash>` string.
 * Uses constant-time buffer comparison to prevent timing attacks.
 */
export function verifyPassword(plainText: string, combinedHash: string): boolean {
  if (!plainText || !combinedHash) return false;
  try {
    const parts = combinedHash.split(":");
    if (parts.length !== 2) return false;
    const [salt, expectedHash] = parts;

    const computedHash = crypto.scryptSync(plainText, salt, 64, {
      N: 16384,
      r: 8,
      p: 1,
    }).toString("hex");

    const expectedBuffer = Buffer.from(expectedHash, "hex");
    const computedBuffer = Buffer.from(computedHash, "hex");

    if (expectedBuffer.length !== computedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, computedBuffer);
  } catch (err) {
    console.error("Password verification error:", err);
    return false;
  }
}

/**
 * Generate a cryptographically signed session token for cookies
 */
export function createSignedSessionToken(payload: {
  uid: string;
  email: string;
  role: "admin";
}): string {
  const data = {
    ...payload,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    iat: Date.now(),
  };
  const bodyBase64 = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(bodyBase64)
    .digest("base64url");
  return `${bodyBase64}.${signature}`;
}

/**
 * Verify a cryptographically signed session token
 */
export function verifySignedSessionToken(token: string): {
  uid: string;
  email: string;
  role: "admin";
} | null {
  if (!token) return null;
  try {
    const [bodyBase64, providedSig] = token.split(".");
    if (!bodyBase64 || !providedSig) return null;

    const expectedSig = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(bodyBase64)
      .digest("base64url");

    const providedBuffer = Buffer.from(providedSig);
    const expectedBuffer = Buffer.from(expectedSig);

    if (
      providedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(bodyBase64, "base64url").toString("utf-8"));
    if (payload.exp && payload.exp < Date.now()) {
      return null; // Expired
    }

    if (payload.role !== "admin") {
      return null;
    }

    return {
      uid: payload.uid || "admin",
      email: payload.email || "hello@oddboxstudio.in",
      role: "admin",
    };
  } catch {
    return null;
  }
}

