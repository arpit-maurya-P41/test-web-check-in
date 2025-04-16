import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function DELETE(req: Request) {
    console.log("Detected DELETE request");
    const id = req.url.split("/").pop();

    try {
        await prisma.users.delete({ where: { id: Number(id) } });

        const users = await prisma.users.findMany({
            orderBy: { id: "asc" },
            select: {
                id: true,
                name: true,
                email: true,
                slack_user_id: true,
                password: true,
                user_team_mappings: {
                    select: {
                        team_id: true,
                        teams: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                roles: {
                    select: {
                        id: true,
                        role_name: true,
                    },
                },
            },
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error("Error Detacted in dashboard DELETE Request", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
