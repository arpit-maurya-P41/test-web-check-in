import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const teamChannelId = req.nextUrl.searchParams.get("teamChannelId");
        const checkins = await prisma.checkins.findMany({
            where: teamChannelId
            ? { slack_channel_id: teamChannelId }
            : undefined,
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
                                is_met: true
                            }
                        }
                    },
                },
                users: {
                    select: {
                        first_name: true,
                        last_name : true
                    }
                }
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