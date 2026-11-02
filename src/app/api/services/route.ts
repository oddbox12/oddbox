import { NextRequest, NextResponse } from "next/server";
import { getAllServices, upsertService } from "@/lib/repositories/services";
import { getAdminSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const services = await getAllServices();
    return NextResponse.json(services);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch services" }, { status: 500 });
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

    const id = body.id || `service-${Date.now()}`;
    const newService = await upsertService({
      id,
      title: body.title,
      slug: body.slug || id,
      number: body.number || "01",
      shortDescription: body.shortDescription || "",
      description: body.description || "",
      coverImageUrl: body.coverImageUrl || "/images/services/services-01.jpg",
      displayOrder: body.displayOrder || 99,
      isFeatured: body.isFeatured !== false,
      isActive: body.isActive !== false,
      features: body.features || [],
    });

    return NextResponse.json(newService, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create service" }, { status: 500 });
  }
}

