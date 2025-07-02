import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  const segments = pathname.split("/");
  const teamIdStr = segments[3];
  const teamId = parseInt(teamIdStr, 10);

  console.log("Detected GET request");

  const { searchParams } = new URL(req.url);
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");
  const isPaginated = pageParam !== null && limitParam !== null;

  try {
    if (isPaginated) {
      const page = parseInt(pageParam || "1", 10);
      const limit = parseInt(limitParam || "10", 10);
      const skip = (page - 1) * limit;

      const [users, totalUsers] = await Promise.all([
        prisma.users.findMany({
          where: {
            is_active: true,
            user_team_mappings: {
              some: { team_id: teamId },
            },
          },
          orderBy: { id: "asc" },
          skip,
          take: limit,
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
            user_team_role: {
              where: {
                team_id: teamId
              },
              select: {
                role_id: true,
                check_in: true
              },
              take: 1
            },
          },
        }),
        prisma.users.count({
          where: {
            is_active: true,
            user_team_mappings: {
              some: { team_id: teamId },
            },
          },
        }),
      ]);

      return NextResponse.json({
        data: users,
        meta: {
          total: totalUsers,
          page,
          limit,
          totalPages: Math.ceil(totalUsers / limit),
        },
      });
    }
  } catch (error) {
    console.error("Error Detacted in dashboard GET Request", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
