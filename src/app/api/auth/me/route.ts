import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ isAuthenticated: false, user: null }, { status: 401 });
  }
  return NextResponse.json({ isAuthenticated: true, user: session.user });
}

