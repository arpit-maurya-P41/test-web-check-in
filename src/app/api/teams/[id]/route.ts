import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(req: Request) {
    console.log("Detected DELETE request");
    const id = req.url.split("/").pop();

    try {
        await prisma.teams.delete({ where: { id: Number(id) } });

        const teams = await prisma.teams.findMany({ orderBy: { id: "asc" } });
        return NextResponse.json(teams);
    } catch (error) {
        console.error("Error Detacted in dashboard DELETE Request", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
