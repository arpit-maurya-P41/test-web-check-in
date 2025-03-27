import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    console.log("Detected GET request");

    try {
        const url = new URL(req.url);
        const startDateParam = url.searchParams.get("startDate");
        const endDateParam = url.searchParams.get("endDate");

        const teamsParam = url.searchParams.get("teams")?.split(",") || [];
        const usersParam = url.searchParams.get("users")?.split(",") || [];

        const startDate = startDateParam ? new Date(startDateParam) : new Date("2025-01-01");
        const endDate = endDateParam ? new Date(endDateParam) : new Date();

        const checkins = await prisma.checkins.findMany(
            {
                where: {
                    date: {
                        gte: new Date(startDate),
                        lte: new Date(endDate)
                    },
                    slack_user_id: {
                        in: usersParam.length > 0 ? usersParam : undefined
                    },
                    slack_channel_id: {
                        in: teamsParam.length > 0 ? teamsParam : undefined
                    }
                }
            }
        );

        const allDates = [];
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            allDates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const checkinsWithMissed = allDates.map(date => {
            const checkin = checkins.find(c => new Date(c.date).toDateString() === date.toDateString());
            if (checkin) {
                return { ...checkin, missed: false };
            } else {
                return { date, missed: true };
            }
        });

        const checkouts = await prisma.checkouts.findMany(
            {
                where: {
                    date: {
                        gte: new Date(startDate),
                        lte: new Date(endDate)
                    },
                    slack_user_id: {
                        in: usersParam.length > 0 ? usersParam : undefined
                    },
                    slack_channel_id: {
                        in: teamsParam.length > 0 ? teamsParam : undefined
                    }
                }
            }
        );

        const checkoutsWithMissed = allDates.map(date => {
            const checkout = checkouts.find(c => new Date(c.date).toDateString() === date.toDateString());
            if (checkout) {
                return { ...checkout, missed: false };
            } else {
                return { date, missed: true };
            }
        });

        const users = await prisma.users.findMany();

        const combinedData = allDates.map(date => {
            const checkin = checkinsWithMissed.find(c => new Date(c.date).toDateString() === date.toDateString());
            const checkout = checkoutsWithMissed.find(c => new Date(c.date).toDateString() === date.toDateString());
            let user;
            
            if (checkin && checkin.slack_user_id) {
                user = users.find(u => u.slack_user_id === checkin.slack_user_id);
            }

            return {
                date,
                checkin,
                checkout,
                user
            };
        });

        return NextResponse.json({ data: combinedData });

    }
    catch (error) {
        console.error("Error Detacted in dashboard GET Request", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
