import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminCredentials } from "@/lib/repositories/users";
import { ADMIN_COOKIE_NAME, createAdminSessionToken } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 1. Verify credentials against DB (compares against encrypted password hash)
    const user = await verifyAdminCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password. Please try again." },
        { status: 401 }
      );
    }

    // 2. Issue a signed session token
    const token = createAdminSessionToken(user.id, user.email);
    const expiresInSeconds = 7 * 24 * 60 * 60; // 7 days

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      maxAge: expiresInSeconds,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        uid: user.id,
        email: user.email,
        name: user.name || "Admin",
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
