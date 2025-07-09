import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const date = searchParams.get("date");
    const teamId = searchParams.get("teamId");

    if (!date) {
      return NextResponse.json({ error: "Missing 'date'" }, { status: 400 });
    }

    const dailyCheckins = await prisma.daily_user_checkins.findMany({
      where: {
        is_active: true,
        check_in_date: {
          gte: new Date(`${date}T00:00:00.000Z`),
          lte: new Date(`${date}T23:59:59.999Z`),
        },
        ...(teamId ? { team_id: Number(teamId) } : {}),
      },
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
      },
      select: {
        user_id: true,
        blocker: true,
        goals: {
          select: {
            is_smart: true,
            goal_text: true,
          },
        },
      },
    });


    const checkinMap = new Map<number, typeof checkins[0]>();
    checkins.forEach((c) => checkinMap.set(c.user_id, c));

    let totalGoals = 0;
    let smartGoals = 0;
    let blockerCount = 0;
    const checkedInUsers = [];
    const notCheckedInUsers = [];

    for (const entry of dailyCheckins) {
      const checkin = checkinMap.get(entry.user_id);
      if (!checkin) {
        notCheckedInUsers.push({
          user_id: entry.user_id,
          name: `${entry.users.first_name} ${entry.users.last_name}`,
        });
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
    console.error("Error Detacted in checkins GET Request", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
