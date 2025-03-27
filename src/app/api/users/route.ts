import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    console.log("Detected GET request");

    try {
        const users = await prisma.users.findMany();

        return NextResponse.json({ data: users });

    }
    catch (error) {
        console.error("Error Detacted in dashboard GET Request", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
