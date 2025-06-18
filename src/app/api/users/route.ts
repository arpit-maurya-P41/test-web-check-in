import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET() {
    console.log("Detected GET request");

    try {
        const users = await prisma.users.findMany({
            orderBy: { id: "desc" },
            where: {is_active: true},
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
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
                }
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

        const existingUser = await prisma.users.findFirst({
            where: {
              email: {
                equals: body.email,
                mode: "insensitive",
              },
            },
          });
        
        if (existingUser) {
            await prisma.users.update({
                where: { email: body.email },
                data: {
                    first_name: body.first_name,
                    last_name: body.last_name,
                    email: body.email,
                    check_in_time: body.check_in_time,
                    check_out_time: body.check_out_time,
                    is_active: body.is_active
                },
            });

            await prisma.user_team_mappings.deleteMany({
                where: { user_id: existingUser.id },
            }); 
            await prisma.user_team_mappings.createMany({
                data: body.user_team_mappings.map((id: number) => ({
                    user_id: existingUser.id,
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
                    password: "Password123",
                    role_id: 1,
                    check_in_time: body.check_in_time,
                    check_out_time: body.check_out_time,
                    timezone: "Asia/Kolkata",
                    is_active: true
                },
            });

            await prisma.user_team_mappings.createMany({
                data: body.user_team_mappings.map((id: number) => ({
                    user_id: user.id,
                    team_id: id,
                })),
            });
        }
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