import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/prisma";
import { getDateRange } from "@/utils/dateUtils";

export async function GET(req: NextRequest) {
    console.log("Detected GET request");

    try {
        const url = new URL(req.url);

        const startDateParam = url.searchParams.get("startDate") ?? "2025-01-01";
        const endDateParam = url.searchParams.get("endDate");
        const teamIdParam = url.searchParams.get("teamId") ?? "";
        const userId = url.searchParams.get("users")?.split(",") || [];
        const teamId = teamIdParam && !isNaN(Number(teamIdParam)) ? Number(teamIdParam) : null;

        const startDate = new Date(startDateParam);
        let endDate = endDateParam ? new Date(endDateParam) : new Date();

        if (endDate.getTime() > new Date().getTime()) {
            endDate = new Date();
        }


        const checkins = await prisma.daily_user_checkins.findMany({
            where: {
                check_in_date: {
                    gte: startDate,
                    lte: endDate,
                },
                ...(teamId !== null && { team_id: teamId }),
                ...(userId.length > 0 && { user_id: { in: userId.map(Number) } }),
                is_active: true,
            },
            select: {
                user_id: true,
                team_id: true,
                check_in_date: true,
                is_blocked: true,
                smart_goals: true,
                has_checked_in: true,
                created_at: true,
                updated_at: true,
                users: {
                    select: {
                        slack_user_id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                check_in_date: "asc",
            },
        });

        const dateRange = getDateRange(startDateParam, endDateParam ?? "");

        const smartCheckinMap: Record<string, {
            user: { name: string; id: number };
            date: string;
            totalSmartGoal: number;
            checkinCount: number;
          }> = {};
          
          checkins.forEach((checkin) => {
            const date = checkin.check_in_date?.toLocaleDateString();
            const userId = checkin.user_id;
          
            if (!date || !userId) return;
          
            const key = `${userId}_${date}`;
            const smartGoal = typeof checkin.smart_goals === "number" ? Math.round(checkin.smart_goals) : 0;
          
            if (!smartCheckinMap[key]) {
              smartCheckinMap[key] = {
                user: {
                  name: `${checkin.users?.first_name ?? ""} ${checkin.users?.last_name ?? ""}`.trim() || "Unknown",
                  id: userId,
                },
                date,
                totalSmartGoal: smartGoal,
                checkinCount: 1,
              };
            } else {
              smartCheckinMap[key].totalSmartGoal += smartGoal;
              smartCheckinMap[key].checkinCount += 1;
            }
          });
          
          const smartCheckins = Object.values(smartCheckinMap).map(({ user, date, totalSmartGoal, checkinCount }) => {
            const normalizedPercentage = checkinCount > 0
              ?  Math.round((totalSmartGoal / checkinCount) * 100) / 100
              : 0;
          
            return {
              user,
              date,
              percentage: normalizedPercentage,
            };
          });


        const blockedMap: Record<string, number> = {};
        const totalEntriesPerDate: Record<string, number> = {};


        checkins.forEach((checkin) => {
            const date = checkin.check_in_date?.toLocaleDateString();
            const blocked = checkin.is_blocked === true ? 1 : 0;
            if(date)
            {
                blockedMap[date] = (blockedMap[date] ?? 0) + blocked;
                totalEntriesPerDate[date] = (totalEntriesPerDate[date] ?? 0) + 1;
            }
        }, []);

        const blockedUsersCount = dateRange.map(date => {
            const blockedCount = blockedMap[date] ?? 0;
            const totalEntries = totalEntriesPerDate[date] ?? 0;

            const percentage = totalEntries > 0
            ? Math.round(Number(((blockedCount / totalEntries) * 100).toFixed(2)))
            : 0;
            return { date, percentage };
          });

          const checkinsPerDate: Record<string, number> = {};

          checkins.forEach((checkin) => {
            if (checkin.has_checked_in) {
                const date = checkin.check_in_date?.toLocaleDateString();
                if (date) {
                  checkinsPerDate[date] = (checkinsPerDate[date] ?? 0) + 1;
                }
              }
          });
          
          const checkinUserPercentageByDate = dateRange.map((date) => {
            const checkedInCount = checkinsPerDate[date] ?? 0;
            const totalEntries = totalEntriesPerDate[date] ?? 0;

            const percentage = totalEntries > 0
            ? Math.round(Number(((checkedInCount / totalEntries) * 100).toFixed(2)))
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
