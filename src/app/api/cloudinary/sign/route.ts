import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAdminSession } from "@/lib/auth/session";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized. Please log in at /admin/login." }, { status: 401 });
  }

  try {
    let folder = "oddbox/uploads";
    try {
      const body = await req.json();
      if (body?.folder) folder = body.folder;
    } catch {
      // use default folder
    }
    const timestamp = Math.round(new Date().getTime() / 1000);
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!apiSecret || !apiKey || !cloudName) {
      // In dev fallback mode if Cloudinary is not configured yet, return dev guidance
      return NextResponse.json({
        mock: true,
        message: "Cloudinary credentials not configured yet in .env",
        folder,
        timestamp,
      });
    }

    const paramsToSign = {
      folder,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    return NextResponse.json({
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate upload signature" }, { status: 500 });
  }
}

