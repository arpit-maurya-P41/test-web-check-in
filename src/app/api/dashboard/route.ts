import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { getDateRange } from "@/utils/dateUtils";

export async function GET(req: NextRequest) {
    console.log("Detected GET request");

    try {
        const url = new URL(req.url);

        const startDateParam = url.searchParams.get("startDate") ?? "2025-01-01";
        const endDateParam = url.searchParams.get("endDate");
        const teamChannelId = url.searchParams.get("teamChannelId") ?? "";
        const userSlackIds = url.searchParams.get("users")?.split(",") || [];

        const startDate = new Date(startDateParam);
        let endDate = endDateParam ? new Date(endDateParam) : new Date();

        if (endDate.getTime() > new Date().getTime()) {
            endDate = new Date();
        }

        const checkins = await prisma.checkins.findMany({
            where: {
                created_at: {
                    gte: startDate,
                    lte: endDate,
                },
                slack_channel_id: teamChannelId,
                slack_user_id: {
                    in: userSlackIds.length > 0 ? userSlackIds : undefined,
                },
            },
            select: {
                slack_user_id: true,
                slack_channel_id: true,
                created_at: true,
                blocker: true,
                users: {
                    select: {
                        slack_user_id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },
                goals: {
                    select: {
                        id: true,
                        is_smart: true,
                    },
                },
            },
            orderBy: {
                created_at: "asc",
            },
        });
        const dateRange = getDateRange(startDateParam, endDateParam ?? "");

        const smartCheckins = checkins.map((checkin) => {             
            return {
                date: checkin.created_at?.toLocaleDateString(),
                user: {
                    name: `${checkin.users?.first_name} ${checkin.users?.last_name ?? ""}` || "Unknown",
                    id: checkin.users?.slack_user_id || "no-id"
                },
                percentage:
                    checkin.goals.length === 0
                        ? 0
                        : Math.floor(
                              (checkin.goals.filter((goal) => goal.is_smart).length /
                                  checkin.goals.length) *
                                  100
                          ),
            };
        });

        const teamUserCount = await prisma.user_team_mappings.count({
            where: {
              teams: {
                slack_channel_id: teamChannelId
              }
            }
          });

        const blockedMap: Record<string, number> = {};

        checkins.forEach((checkin) => {
            const date = checkin.created_at?.toLocaleDateString();
            const blocked = checkin.blocker?.length ? 1 : 0;
            if(date)
            {
                blockedMap[date] = (blockedMap[date] ?? 0) + blocked;
            }
        }, []);

        let selectedUsersCount = userSlackIds.length;
        if(selectedUsersCount === 0)
        {
            selectedUsersCount = teamUserCount;
        }
        const blockedUsersCount = dateRange.map(date => {
            const blockedCount = blockedMap[date] ?? 0;

            const percentage = blockedMap[date] !== 0
              ? Math.floor((blockedCount / selectedUsersCount) * 100)
              : 0;
            return { date, percentage };
          });

          const checkinsPerDate: Record<string, Set<string>> = {};

          checkins.forEach((checkin) => {
              const date = checkin.created_at?.toLocaleDateString();
              if (date) {
                  if (!checkinsPerDate[date]) {
                      checkinsPerDate[date] = new Set();
                  }
                  checkinsPerDate[date].add(checkin.slack_user_id);
              }
          });
          
          const checkinUserPercentageByDate = dateRange.map((date) => {
            const userCount = checkinsPerDate[date]?.size || 0;
            const percentage = selectedUsersCount > 0
                ? Math.floor((userCount / selectedUsersCount) * 100)
                : 0;
            
            return {
                date,
                percentage
            };
        });
          
        return NextResponse.json({smartCheckins, blockedUsersCount, checkinUserPercentageByDate});
    
    } catch (error) {
        console.error("Error Detacted in dashboard GET Request", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
