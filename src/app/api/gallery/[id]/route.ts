import { NextRequest, NextResponse } from "next/server";
import { getGalleryItemById, upsertGalleryItem, deleteGalleryItem } from "@/lib/repositories/gallery";
import { getAdminSession } from "@/lib/auth/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await getGalleryItemById(id);
  if (!item) {
    return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const cleanId = decodeURIComponent(id);
  try {
    const body = await req.json();
    const updated = await upsertGalleryItem({ ...body, id: cleanId });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update item" }, { status: 500 });
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
  const cleanId = decodeURIComponent(id);
  try {
    await deleteGalleryItem(cleanId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete item" }, { status: 500 });
  }
}

