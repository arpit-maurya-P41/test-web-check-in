import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function POST(req: Request) {
    try {
      const body = await req.json();

        const user = await prisma.users.create({
          data: {
            first_name: body.first_name,
            last_name: body.last_name,
            email: body.email,
            password: "Password123",
            check_in_time: body.check_in_time,
            check_out_time: body.check_out_time,
            timezone: "Asia/Kolkata",
            is_active: true,
          },
        });
  
        await prisma.user_team_mappings.createMany({
          data: body.user_team_mappings.map((id: number) => ({
            user_id: user.id,
            team_id: id,
          })),
        });
  
        for (const teamId of body.user_team_mappings) {
          await prisma.user_team_role.create({
            data: {
              user_id: user.id,
              team_id: teamId,
              role_id: 5,
            },
          });
        }

        console.log("create user");
        const users = await prisma.users.findMany({
        orderBy: { id: "asc" },
        where: { is_active: true },
      });
      return NextResponse.json(users);
    } catch (error) {
      console.error("Error Detacted in dashboard POST Request", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
  