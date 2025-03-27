import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    console.log("Detected GET request");

    try {
        const teams = await prisma.teams.findMany();

        return NextResponse.json({ data: teams });

    }
    catch (error) {
        console.error("Error Detacted in dashboard GET Request", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
