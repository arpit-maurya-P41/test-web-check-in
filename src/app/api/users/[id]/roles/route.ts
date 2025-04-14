import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: Request) {
    const urlParams = req.url.split("/");
    const userId = urlParams[urlParams.length - 2];

    const userRoles = await prisma.user_role_mappings.findMany({
        where: {
            user_id: Number(userId),
        },
        include: {
            roles: {
                select: {
                    id: true,
                    role_name: true,
                    can_manage_teams: true
                }
            }
        }
    });


    return NextResponse.json({ data: userRoles }, { status: 200 });
}
