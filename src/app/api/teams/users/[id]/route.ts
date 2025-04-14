import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: Request) {
    const userId = Number(req.url.split("/").pop());

    const userTeams = await prisma.user_team_mappings.findMany({
        where: {
            user_id: userId,
        },
    });
    
    const users = await prisma.users.findMany({
        include: {
            user_team_mappings: {
                where: {
                    team_id: {
                        in: userTeams.map((team) => team.team_id),
                    }
                },
            },
        }
    });
    
    return NextResponse.json({ data: users }, { status: 200 });
}
