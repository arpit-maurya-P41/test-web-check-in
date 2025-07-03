import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const teamId = searchParams.get('teamId');

    if (!userId || !teamId) {
      return NextResponse.json(
        { error: "User ID and Team ID are required." },
        { status: 400 }
      );
    }

    // First check if user is a member of the team
    const userTeamMapping = await prisma.user_team_mappings.findFirst({
      where: {
        user_id: parseInt(userId),
        team_id: parseInt(teamId),
      },
    });

    if (!userTeamMapping) {
      return NextResponse.json(
        { error: "User is not a member of this team." },
        { status: 404 }
      );
    }

    // Then check their role in the team
    const userTeamRole = await prisma.user_team_role.findFirst({
      where: {
        user_id: parseInt(userId),
        team_id: parseInt(teamId),
      },
      include: {
        roles: true,
        teams: true
      }
    });

    if (!userTeamRole) {
      return NextResponse.json(
        { error: "User-role not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(userTeamRole);
  } catch (error) {
    console.error("Error fetching user team role:", error);
    return NextResponse.json(
      { error: "Failed to fetch user role" },
      { status: 500 }
    );
  }
}

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
