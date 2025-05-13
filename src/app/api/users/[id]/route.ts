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
                first_name: true,
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

export async function GET(req: Request) {
    const userId = await Number(req.url.split("/").pop());

    if (isNaN(userId)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }
    try {
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: {
                first_name: true,
                last_name: true,
                title: true,
                location: true,
                timezone: true,
                check_in_time: true,
                check_out_time: true,
                about_you: true
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        return NextResponse.json(user);
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const userId = Number(req.url.split("/").pop());

        if (isNaN(userId)) {
            return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
        }

        const body = await req.json();

        const {
            first_name,
            last_name,
            title,
            location,
            timezone,
            check_in_time,
            check_out_time,
            about_you
        } = body;

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: {
                first_name,
                last_name,
                title,
                location,
                timezone,
                check_in_time,
                check_out_time,
                about_you
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error in POST:", error);
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}