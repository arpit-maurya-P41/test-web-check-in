import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { removeFutureCheckins } from "@/utils/helper";

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const pathname = url.pathname;

    const segments = pathname.split("/");
    const teamIdStr = segments[3];
    const teamId = parseInt(teamIdStr, 10);

    if (isNaN(teamId) || !teamId) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    await prisma.teams.update({
      where: { id: teamId },
      data: {
        is_active: false,
      },
    });

    await prisma.user_team_mappings.deleteMany({
      where: { team_id: teamId },
    });

    await prisma.user_team_role.deleteMany({
      where: { team_id: teamId },
    });

    await removeFutureCheckins(undefined, teamId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in deactivate route POST request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
