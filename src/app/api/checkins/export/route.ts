import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    let startDateParam = url.searchParams.get("startDate") ?? "2025-01-01";
    const endDateParam = url.searchParams.get("endDate");
    const teamId = url.searchParams.get("teamId") ? Number(url.searchParams.get("teamId")) : null;

    const firstCheckin = await prisma.daily_user_checkins.findFirst({
      orderBy: {
        check_in_date: "asc",
      },
      select: {
        check_in_date: true,
      },
    });

    if (firstCheckin && new Date(startDateParam) < firstCheckin.check_in_date) {
      startDateParam = firstCheckin.check_in_date.toISOString().split("T")[0];
    }

    const dailyCheckins = await prisma.daily_user_checkins.findMany({
        where: {
          check_in_date: {
            gte: new Date(startDateParam),
            lte: endDateParam ? new Date(endDateParam) : undefined,
          },
          ...(teamId !== null ? { team_id: teamId } : {}),
          is_active: true
        },
        orderBy: { check_in_date: "asc" },
        select: {
          smart_goals: true,
          is_blocked: true,
          has_checked_in: true,
          check_in_date: true,
          users: {
            select: {
              first_name: true,
              email: true,
              last_name: true,
              id: true
            },
          },
          teams: {
            select: {
              name: true,
              id: true
            },
          },          
        },
      });

      const exportData = [];

    for (const entry of dailyCheckins) {
      const checkin = await prisma.checkins.findFirst({
        where: {
          user_id: entry.users.id,
          team_id: entry.teams.id,
          checkin_date: entry.check_in_date,
        },
        select: {
          id: true,
          blocker: true,
          goals: {
            select: {
              goal_text: true,
              is_smart: true,
            },
          },
        },
      });

      const goals = checkin?.goals || [];

      exportData.push({
        date: entry.check_in_date.toISOString().split("T")[0],
        teamName: entry.teams?.name || "Unknown",
        userName: `${entry.users.first_name} ${entry.users.last_name}`.trim(),
        userEmail: entry.users.email,
        hasCheckedIn: entry.has_checked_in,
        isBlocked: entry.is_blocked || false,
        goals: goals.map((g) => ({
          goalText: g.goal_text,
          isSmart: g.is_smart,
        })),
        smartGoalsPercentage: entry.smart_goals,
      });
    }

      return NextResponse.json({ exportData });
  } catch (error) {
    console.error("Error Detected in checkins GET Request", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
