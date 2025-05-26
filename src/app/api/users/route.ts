import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET() {
    console.log("Detected GET request");

    try {
        const users = await prisma.users.findMany({
            orderBy: { id: "asc" },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                slack_user_id: true,
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
        console.error("Error Detacted in dashboard GET Request", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const existingUser = await prisma.users.findUnique({
            where: { id: body.id },
        });

        if (existingUser) {
            await prisma.users.update({
                where: { id: body.id },
                data: {
                    first_name: body.first_name,
                    last_name: body.last_name,
                    email: body.email,
                    slack_user_id: body.slack_user_id,
                    role_id: body.role_id
                },
            });

            await prisma.user_team_mappings.deleteMany({
                where: { user_id: body.id },
            }); 
            await prisma.user_team_mappings.createMany({
                data: body.user_team_mappings.map((id: number) => ({
                    user_id: body.id,
                    team_id: id,
                })),
            });
        }
        else {
            const user = await prisma.users.create({
                data: {
                    first_name : body.first_name,
                    last_name: body.last_name,
                    email: body.email,
                    slack_user_id: body.slack_user_id,
                    password: "Password123",
                    role_id: body.role_id
                },
            });
            await prisma.user_team_mappings.createMany({
                data: body.user_team_mappings.map((id: number) => ({
                    user_id: user.id,
                    team_id: id,
                })),
            });
        }
        const users = await prisma.users.findMany({orderBy: { id: "asc" }});
        return NextResponse.json(users);
    } catch (error) {
        console.error("Error Detacted in dashboard POST Request", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}