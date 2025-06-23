import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        await prisma.users.update({
            where: { id: body.id },
            data: {
                is_active: false
            },
        });

        await prisma.user_team_mappings.deleteMany({
            where: { user_id: body.id },
        }); 

        await prisma.user_team_role.deleteMany({
            where: { user_id: body.id },
        }); 

        const users = await prisma.users.findMany({orderBy: { id: "asc" }, where: {is_active: true}});

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error Detacted in dashboard POST Request", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}