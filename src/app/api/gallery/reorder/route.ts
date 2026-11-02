import { NextRequest, NextResponse } from "next/server";
import { bulkUpdateGalleryOrder } from "@/lib/repositories/gallery";
import { getAdminSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { items } = await req.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "items array required" }, { status: 400 });
    }

    await bulkUpdateGalleryOrder(items);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to reorder items" }, { status: 500 });
  }
}

