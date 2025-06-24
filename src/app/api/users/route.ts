import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET() {
  console.log("Detected GET request");

  try {
    const [users, latestUser] = await Promise.all([
      prisma.users.findMany({
        orderBy: { id: "desc" },
        where: { is_active: true },
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
          },
        },
      }),
      prisma.users.findFirst({
        orderBy: { id: "desc" },
        select: { id: true },
      }),
    ]);
    const latestUserId = (latestUser?.id ?? 0) + 1;
    return NextResponse.json({users : users, latestUserId });
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
        where: { email: existingUser.email },
        data: {
          first_name: body.first_name,
          last_name: body.last_name,
          email: body.email,
          check_in_time: body.check_in_time,
          check_out_time: body.check_out_time,
          is_active: body.is_active,
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

      for (const teamId of body.user_team_mappings) {
        const existingRole = await prisma.user_team_role.findFirst({
          where: {
            user_id: existingUser.id,
            team_id: teamId,
          },
        });

        if (!existingRole) {
          await prisma.user_team_role.create({
            data: {
              user_id: existingUser.id,
              team_id: teamId,
              role_id: 5,
            },
          });
        }
      }
    }else {
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
    }
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
