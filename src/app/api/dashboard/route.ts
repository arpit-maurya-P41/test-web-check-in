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

        const checkinsWithMissed = [];

        allDates.forEach(date => {
            const currentDateCheckins = [];
            checkins.forEach(c => {
                if (new Date(c.date).toDateString() === date.toDateString()) currentDateCheckins.push(c);
            });

            if (currentDateCheckins.length > 0) {
                currentDateCheckins.forEach(checkin => {
                    checkinsWithMissed.push({ ...checkin, missed: false });
                });
            } else {
                checkinsWithMissed.push({ date, missed: true });
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

        const checkoutsWithMissed = [];

        allDates.forEach(date => {
            const currentDateCheckouts = [];
            checkouts.forEach(c => {
                if (new Date(c.date).toDateString() === date.toDateString()) currentDateCheckouts.push(c);
            });

            if (currentDateCheckouts.length > 0) {
                currentDateCheckouts.forEach(checkin => {
                    checkoutsWithMissed.push({ ...checkin, missed: false });
                });
            } else {
                checkoutsWithMissed.push({ date, missed: true });
            }
        });

        console.log("here")


        const users = await prisma.users.findMany();

        let combinedData = [];

        checkinsWithMissed.forEach(checkin => {
            const checkout = checkoutsWithMissed.find(c => new Date(c.date).toDateString() === checkin.date.toDateString()
                && c.slack_user_id === checkin.slack_user_id);

            let user = users.find(u => u.slack_user_id === checkin.slack_user_id);

            combinedData.push({
                date: checkin.date,
                checkin,
                checkout,
                user
            })
        });

        combinedData = combinedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json({ data: combinedData });

    }
    catch (error) {
        console.error("Error Detacted in dashboard GET Request", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
