import { NextRequest, NextResponse } from "next/server";
import { getAllJournalPosts, upsertJournalPost } from "@/lib/repositories/journal";
import { getAdminSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session = await getAdminSession();
    // Public requests only see published posts unless admin
    const all = searchParams.get("all") === "true" && session.isAuthenticated;
    const posts = await getAllJournalPosts(!all);
    return NextResponse.json(posts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch journal posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const id = body.slug || `post-${Date.now()}`;
    const newPost = await upsertJournalPost({
      ...body,
      id,
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create post" }, { status: 500 });
  }
}

