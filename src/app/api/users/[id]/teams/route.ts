import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: Request) {
    const urlParams = req.url.split("/");
    const userId = urlParams[urlParams.length - 2]

    const userTeams = await prisma.user_team_mappings.findMany({
        where: {
            user_id: Number(userId),
        },
    });

    const teams = await prisma.teams.findMany({
        where: {
            id: {
                in: userTeams.map((team) => team.team_id),
            }
        }
    });

    return NextResponse.json({ data: teams }, { status: 200 });
}
