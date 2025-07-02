import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, teamId } = await req.json();

    if (!userId || !teamId) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    await prisma.user_team_role.deleteMany({
      where: { user_id: userId, team_id: teamId },
    });

    await prisma.user_team_mappings.deleteMany({
      where: { user_id: userId, team_id: teamId },
    });

    return NextResponse.json({ message: "User removed successfully." });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
