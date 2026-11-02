import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/session";
import { verifyAdminCredentials, updateAdminUserPassword } from "@/lib/repositories/users";

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session.isAuthenticated || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Both current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Verify current password
    const verifiedUser = await verifyAdminCredentials(session.user.email, currentPassword);
    if (!verifiedUser) {
      return NextResponse.json(
        { error: "Incorrect current password" },
        { status: 400 }
      );
    }

    // Save encrypted new password in DB
    const success = await updateAdminUserPassword(session.user.email, newPassword);
    if (!success) {
      return NextResponse.json(
        { error: "Failed to update password in database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password updated and encrypted successfully in database",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to change password" },
      { status: 500 }
    );
  }
}

