import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function POST(req: Request) {
  try {
    const { user_id, team_id, role_id } = await req.json();

    const existing = await prisma.user_team_role.findFirst({
      where: { user_id, team_id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "User-role not found." },
        { status: 404 }
      );
    }

    await prisma.user_team_role.update({
      where: { id: existing.id },
      data: { role_id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving user team role:", error);
    return NextResponse.json(
      { error: "Failed to save user role" },
      { status: 500 }
    );
  }
}
