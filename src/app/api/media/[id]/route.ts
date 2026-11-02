import { NextRequest, NextResponse } from "next/server";
import { deleteMediaAsset } from "@/lib/repositories/media";
import { getAdminSession } from "@/lib/auth/session";

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
    const result = await deleteMediaAsset(id);
    if (!result.success) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete media asset" }, { status: 500 });
  }
}

