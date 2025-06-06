import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { teams } from "@prisma/client";


export async function GET() {
    console.log("Detected GET request");

    try {
        const teams = await prisma.teams.findMany({ orderBy: { id: "desc" } });
        return NextResponse.json(teams);
    } catch (error) {
        console.error("Error Detacted in dashboard GET Request", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body: teams = await req.json();
        const existingTeam = await prisma.teams.findUnique({
            where: { id: body.id },
        });

        if (existingTeam) {
            await prisma.teams.update({
                where: { id: body.id },
                data: {
                    name: body.name,
                    slack_channel_id: body.slack_channel_id,
                },
            });
        }
        else {
            await prisma.teams.create({
                data: {
                    name: body.name,
                    slack_channel_id: body.slack_channel_id,
                },
            });
        }

        const teams = await prisma.teams.findMany({ orderBy: { id: "desc" } });
        return NextResponse.json(teams);
    } catch (error) {
        console.error("Error Detacted in dashboard POST Request", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}