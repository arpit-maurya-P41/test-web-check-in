import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { teams } from "@prisma/client";


export async function GET() {
    console.log("Detected GET request");

    try {
        const teams = await prisma.teams.findMany({ orderBy: { id: "desc" }, where : { is_active: true} });
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
            where: { slack_channel_id: body.slack_channel_id },
        });

        if (existingTeam) {
            await prisma.teams.update({
                where: { slack_channel_id: body.slack_channel_id },
                data: {
                    name: body.name,
                    slack_channel_id: body.slack_channel_id,
                    is_active: true
                },
            });
        }
        else {
            await prisma.teams.create({
                data: {
                    name: body.name,
                    slack_channel_id: body.slack_channel_id,
                    is_active: true
                },
            });
        }

        const teams = await prisma.teams.findMany({ orderBy: { id: "desc" }, where : { is_active: true} });
        return NextResponse.json(teams);
    } catch (error) {
        console.error("Error Detacted in dashboard POST Request", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}