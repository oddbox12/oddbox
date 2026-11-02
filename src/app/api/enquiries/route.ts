import { NextRequest, NextResponse } from "next/server";
import { createEnquiry, getAllEnquiries } from "@/lib/repositories/enquiries";
import { getAdminSession } from "@/lib/auth/session";

// In-memory rate limiting map (IP -> timestamps)
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 5;

  const timestamps = (rateLimitMap.get(ip) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    return true;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") || undefined;

  try {
    const enquiries = await getAllEnquiries(statusFilter);
    return NextResponse.json(enquiries);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch enquiries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a minute before submitting another enquiry." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, phone, interest, message, honeypot } = body;

    // Spam honeypot check
    if (honeypot) {
      return NextResponse.json({ success: true, message: "Enquiry received." });
    }

    // Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Please enter a valid name." }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!phone || typeof phone !== "string" || phone.trim().length < 6) {
      return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
    }

    const saved = await createEnquiry({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      interest: (interest || "Photography").trim(),
      message: (message || "").trim(),
    });

    return NextResponse.json({ success: true, enquiryId: saved.id }, { status: 201 });
  } catch (error: any) {
    console.error("Enquiry submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit enquiry. Please try again." },
      { status: 500 }
    );
  }
}

