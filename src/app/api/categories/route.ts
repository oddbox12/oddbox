import { NextRequest, NextResponse } from "next/server";
import { getAllCategories, upsertCategory } from "@/lib/repositories/categories";
import { getAdminSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.name || !body.slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const id = body.id || body.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const category = await upsertCategory({
      id,
      name: body.name,
      slug: body.slug,
      description: body.description || "",
      coverImageUrl: body.coverImageUrl || "",
      displayOrder: body.displayOrder || 99,
      isActive: body.isActive !== false,
      itemCount: 0,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}

