import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const date = searchParams.get("date");
    const teamId = searchParams.get("teamId");
    const userId = searchParams.get("userId");
    const isAdmin = searchParams.get("isAdmin") === "true";

    if (!date) {
      return NextResponse.json({ error: "Missing 'date'" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Missing 'userId'" }, { status: 400 });
    }

    // If teamId is provided, use it directly
    // If no teamId (All Teams) and not admin, get user's accessible teams
    let accessibleTeamIds: number[] = [];
    
    if (!teamId && !isAdmin) {
      const userTeams = await prisma.user_team_mappings.findMany({
        where: {
          user_id: Number(userId),
        },
        select: {
          team_id: true,
        },
      });
      
      accessibleTeamIds = userTeams.map(team => team.team_id);
      
      if (accessibleTeamIds.length === 0) {
        // If user has no teams, return empty response
        return NextResponse.json({
          date,
          teamSummary: {
            totalMembers: 0,
            participation: { count: 0, percentage: 0 },
            blockers: { count: 0, percentage: 0 },
            smart: { totalGoals: 0, smartGoals: 0, percentage: 0 },
          },
          checkedInUsers: [],
          notCheckedInUsers: []
        });
      }
    }

    const whereClause = {
      is_active: true,
      check_in_date: {
        gte: new Date(`${date}T00:00:00.000Z`),
        lte: new Date(`${date}T23:59:59.999Z`),
      },
      ...(teamId ? { team_id: Number(teamId) } : {}),
      ...(!teamId && !isAdmin ? { team_id: { in: accessibleTeamIds } } : {}),
    };

    const dailyCheckins = await prisma.daily_user_checkins.findMany({
      where: whereClause,
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    const userIds = dailyCheckins.map((d) => d.user_id);

    const checkins = await prisma.checkins.findMany({
      where: {
        user_id: { in: userIds },
        checkin_date: {
          gte: new Date(`${date}T00:00:00.000Z`),
          lte: new Date(`${date}T23:59:59.999Z`),
        },
        ...(teamId ? { team_id: Number(teamId) } : {}),
        ...(!teamId && !isAdmin ? { team_id: { in: accessibleTeamIds } } : {}),
      },
      select: {
        user_id: true,
        team_id: true,
        blocker: true,
        goals: {
          select: {
            is_smart: true,
            goal_text: true,
          },
        },
      },
    });

    const checkinMap = new Map<string, typeof checkins[0]>();
    checkins.forEach((c) => checkinMap.set(`${c.user_id}-${c.team_id}`, c));

    let totalGoals = 0;
    let smartGoals = 0;
    let blockerCount = 0;
    const checkedInUsers = [];
    const notCheckedInUsers: { user_id: number; name: string }[] = [];
    const notCheckedUserIds = new Set<number>();

    for (const entry of dailyCheckins) {
      const key = `${entry.user_id}-${entry.team_id}`;
      const checkin = checkinMap.get(key);
      if (!checkin) {
        if (!notCheckedUserIds.has(entry.user_id)) {
          notCheckedUserIds.add(entry.user_id);
          notCheckedInUsers.push({
            user_id: entry.user_id,
            name: `${entry.users.first_name} ${entry.users.last_name}`,
          });
        }
        continue;
      }
      const goals = checkin?.goals || [];
      const smartCount = goals.filter((g) => g.is_smart).length;

      if (goals.length > 0) {
        totalGoals += goals.length;
        smartGoals += smartCount;
      }

      if (checkin.blocker) blockerCount++;
      checkedInUsers.push({
        user_id: entry.user_id,
        team_id: entry.team_id,
        has_checked_in: true,
        is_blocked: !!checkin.blocker,
        user: {
          name: `${entry.users.first_name} ${entry.users.last_name}`,
          goals,
        },
      });
    };

    const totalMembers = dailyCheckins.length;
    const participationCount = checkinMap.size;

    const response = {
      date,
      teamSummary: {
        totalMembers,
        participation: {
          count: participationCount,
          percentage: totalMembers ?  Math.floor((participationCount / totalMembers) * 100) : 0,
        },
        blockers: {
          count: blockerCount,
          percentage: totalMembers ?  Math.floor((blockerCount / totalMembers) * 100) : 0,
        },
        smart: {
          totalGoals: totalGoals,
          smartGoals: smartGoals,
          percentage: totalGoals ?  Math.floor((smartGoals / totalGoals) * 100) : 0,
        },
      },
      checkedInUsers,
      notCheckedInUsers
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error Detected in checkins GET Request", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
