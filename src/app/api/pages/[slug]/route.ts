import { NextRequest, NextResponse } from "next/server";
import { getPageContent, updatePageContent } from "@/lib/repositories/pages";
import { getAdminSession } from "@/lib/auth/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!["home", "about", "contact"].includes(slug)) {
    return NextResponse.json({ error: "Invalid page slug" }, { status: 400 });
  }

  try {
    const data = await getPageContent(slug as any);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch page content" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  if (!["home", "about", "contact"].includes(slug)) {
    return NextResponse.json({ error: "Invalid page slug" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const updated = await updatePageContent(slug as any, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update page content" }, { status: 500 });
  }
}

