import { NextRequest, NextResponse } from "next/server";
import { getAllMediaAssets, upsertMediaAsset } from "@/lib/repositories/media";
import { getAdminSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder") || undefined;
  const type = searchParams.get("type") as "image" | "video" | undefined;

  try {
    const media = await getAllMediaAssets(folder, type);
    return NextResponse.json(media);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch media" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.secureUrl) {
      return NextResponse.json({ error: "secureUrl is required" }, { status: 400 });
    }

    const id = body.id || `media-${Date.now()}`;
    const newAsset = await upsertMediaAsset({
      ...body,
      id,
      migrationStatus: body.migrationStatus || "verified",
    });

    return NextResponse.json(newAsset, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create media record" }, { status: 500 });
  }
}

