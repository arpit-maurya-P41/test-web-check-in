import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, team_id, check_in } = body;

    if (
      typeof user_id !== "number" ||
      typeof team_id !== "number" ||
      typeof check_in !== "boolean"
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const updated = await prisma.user_team_role.updateMany({
      where: {
        user_id,
        team_id,
      },
      data: { check_in },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    await prisma.daily_user_checkins.updateMany({
      where: {
        user_id,
        team_id,
      },
      data: { is_active : check_in },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Check-in update error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
