import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        await prisma.teams.update({
            where: { id: body.id },
            data: {
                is_active: false
            },
        });

        const teams = await prisma.teams.findMany({ orderBy: { id: "desc" }, where : {is_active: true} });
        return NextResponse.json(teams);

    } catch (error) {
        console.error("Error Detacted in dashboard POST Request", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}