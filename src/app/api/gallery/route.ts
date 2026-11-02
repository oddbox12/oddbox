import { NextRequest, NextResponse } from "next/server";
import { getPaginatedGallery, upsertGalleryItem } from "@/lib/repositories/gallery";
import { getAdminSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const isPublished = searchParams.has("isPublished")
      ? searchParams.get("isPublished") === "true"
      : undefined;
    const isFeatured = searchParams.has("isFeatured")
      ? searchParams.get("isFeatured") === "true"
      : undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "16", 10);
    const search = searchParams.get("search") || undefined;

    const data = await getPaginatedGallery({
      category,
      isPublished,
      isFeatured,
      page,
      limit,
      search,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch gallery" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.title || !body.imageUrl || !body.categoryId) {
      return NextResponse.json(
        { error: "Title, image URL, and category are required" },
        { status: 400 }
      );
    }

    const id = body.id || `gallery-${Date.now()}`;
    const newItem = await upsertGalleryItem({
      ...body,
      id,
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create gallery item" }, { status: 500 });
  }
}

