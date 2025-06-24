import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET() {
    console.log("Detected GET request");

    try {
        const roles = await prisma.roles.findMany({ orderBy: { id: "asc" } });
        return NextResponse.json(roles);
    } catch (error) {
        console.error("Error Detacted in dashboard GET Request", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
