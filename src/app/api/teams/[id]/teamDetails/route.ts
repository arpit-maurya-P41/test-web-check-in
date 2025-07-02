import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  const segments = pathname.split("/");
  const teamIdStr = segments[3];
  const teamId = parseInt(teamIdStr, 10);

  console.log("Detected GET request");

  if (isNaN(teamId)) {
    return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
  }
  try {
    const team = await prisma.teams.findUnique({
      where: { id: teamId, is_active: true },
      select: {
        name: true,
        team_info: true,
        slack_channel_id: true,
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const teamId = parseInt(body.id, 10);
    if (isNaN(teamId)) {
      return NextResponse.json({ error: "Invalid team ID" }, { status: 400 });
    }

    const { name, team_info, slack_channel_id, is_active } = body;
    const existingTeam = await prisma.teams.findUnique({
      where: { id: teamId },
    });

    if (existingTeam) {
      const updatedTeam = await prisma.teams.update({
        where: { id: teamId },
        data: { name, team_info, slack_channel_id, is_active },
      });
      return NextResponse.json(updatedTeam);
    }

    const duplicateActive = await prisma.teams.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: "insensitive" } },
          { slack_channel_id: { equals: slack_channel_id, mode: "insensitive" } },
        ],
        is_active: true,
      },
    });

    if (duplicateActive) {
      return NextResponse.json(
        { error: "Team name or Slack Channel ID already exists" },
        { status: 409 }
      );
    }

    const duplicateInactive = await prisma.teams.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: "insensitive" } },
          { slack_channel_id: { equals: slack_channel_id, mode: "insensitive" } },
        ],
        is_active: false,
      },
    });

    if (duplicateInactive) {
      const revivedTeam = await prisma.teams.update({
        where: { id: duplicateInactive.id },
        data: {
          name,
          team_info,
          slack_channel_id,
          is_active: true,
        },
      });
      return NextResponse.json(revivedTeam);
    }
    const newTeam = await prisma.teams.create({
      data: {
        id: teamId,
        name,
        team_info,
        slack_channel_id,
        is_active: true,
      },
    });
    return NextResponse.json(newTeam);
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 }
    );
  }
}
