import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { getDateRange } from "@/utils/dateUtils";
import { auth } from "@/auth";
import { isUserAdmin } from "@/app/actions/dashboardActions";

export async function GET(req: NextRequest) {
    console.log("Detected GET request");

    try {
        // Check authentication and admin status
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);

        const startDateParam = url.searchParams.get("startDate") ?? "2025-01-01";
        const endDateParam = url.searchParams.get("endDate");
        const teamChannelId = url.searchParams.get("teamChannelId") ?? "";
        const userId = url.searchParams.get("users")?.split(",") || [];

        // Check if user is admin when accessing all teams data
        if (!teamChannelId) {
            const userIsAdmin = await isUserAdmin(session.user.id);
            if (!userIsAdmin) {
                return NextResponse.json({ error: "Admin access required for all teams data" }, { status: 403 });
            }
        }

        const startDate = new Date(startDateParam);
        let endDate = endDateParam ? new Date(endDateParam) : new Date();

        if (endDate.getTime() > new Date().getTime()) {
            endDate = new Date();
        }

        const whereClause: {
            checkin_date: {
                gte: Date;
                lte: Date;
            };
            users: {
                id: {
                    in: number[] | undefined;
                };
                is_active: boolean;
            };
            slack_channel_id?: string;
        } = {
            checkin_date: {
                gte: startDate,
                lte: endDate,
            },
            users: {
                id: {
                  in: userId.length > 0 ? userId.map(Number) : undefined,
                },
                is_active: true
            }
        };

        // Only add team filter if teamChannelId is provided
        if (teamChannelId) {
            whereClause.slack_channel_id = teamChannelId;
        }

        const checkins = await prisma.checkins.findMany({
            where: whereClause,
            select: {
                slack_user_id: true,
                slack_channel_id: true,
                checkin_date: true,
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
                checkin_date: "asc",
            },
        });
        const dateRange = getDateRange(startDateParam, endDateParam ?? "");

        const smartCheckins = checkins.map((checkin) => {             
            return {
                date: checkin.checkin_date?.toLocaleDateString(),
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

        // Get team user count based on teamChannelId
        let teamUserCount = 0;
        if (teamChannelId) {
            teamUserCount = await prisma.user_team_mappings.count({
                where: {
                  teams: {
                    slack_channel_id: teamChannelId
                  }
                }
            });
        } else {
            // If no team is specified, count distinct users across all teams
            const userTeamMappings = await prisma.user_team_mappings.findMany({
                select: {
                    user_id: true
                },
                distinct: ['user_id']
            });
            teamUserCount = userTeamMappings.length;
        }

        const blockedMap: Record<string, number> = {};

        checkins.forEach((checkin) => {
            const date = checkin.checkin_date?.toLocaleDateString();
            const blocked = checkin.blocker?.length ? 1 : 0;
            if(date)
            {
                blockedMap[date] = (blockedMap[date] ?? 0) + blocked;
            }
        }, []);

        let selectedUsersCount = userId.length;
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
              const date = checkin.checkin_date?.toLocaleDateString();
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
