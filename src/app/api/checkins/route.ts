import { prisma } from "@/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const teamChannelId = searchParams.get("teamChannelId");

    const where: Prisma.checkinsWhereInput = {};

    if (startDate && endDate) {
      where.checkin_date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (teamChannelId) {
        where.slack_channel_id = teamChannelId;
      }

    const checkins = await prisma.checkins.findMany({
      where,
      select: {
        slack_user_id: true,
        checkin_date: true,
        blocker: true,
        feeling: true,
        goals: {
          select: {
            goal_text: true,
            is_smart: true,
            id: true,
            goal_progress: {
              select: {
                is_met: true,
              },
            },
          },
        },
        users: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: {
        checkin_date: "desc",
      },
    });

    return NextResponse.json(checkins);
  } catch (error) {
    console.error("Error Detacted in checkins GET Request", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
