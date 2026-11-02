import { NextRequest, NextResponse } from "next/server";
import { getAllCategories, upsertCategory, deleteCategory } from "@/lib/repositories/categories";
import { getPaginatedGallery } from "@/lib/repositories/gallery";
import { getAdminSession } from "@/lib/auth/session";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const categories = await getAllCategories();
    const existing = categories.find((c) => c.id === id);

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const updated = await upsertCategory({
      ...existing,
      ...body,
      id,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const categories = await getAllCategories();
    const target = categories.find((c) => c.id === id);

    if (!target) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Safety check: ensure no active gallery items are orphaned
    const galleryItems = await getPaginatedGallery({ category: target.slug || target.id, limit: 1 });
    if (galleryItems.total > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category "${target.name}". It contains ${galleryItems.total} gallery items. Please reassign or delete these items first.`,
        },
        { status: 400 }
      );
    }

    await deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 500 });
  }
}

