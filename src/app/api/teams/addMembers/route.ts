import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma"; 

export async function POST(req: NextRequest) {
  try {
    const { emails, teamId } = await req.json();

    if (!emails || !Array.isArray(emails) || !teamId) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const existingUsers = await prisma.users.findMany({
      where: {
        email: {
          in: emails,
        },
        is_active: true
      },
    });

    const userIdList = existingUsers.map((user) => user.id);

    if (userIdList.length === 0) {
      return NextResponse.json({ message: "No existing users found." });
    }

    const alreadyMapped = await prisma.user_team_mappings.findMany({
      where: {
        team_id: teamId,
        user_id: {
          in: userIdList,
        },
      },
    });

    const alreadyMappedUserIds = new Set(alreadyMapped.map((m) => m.user_id));

    const mappingsToCreate = existingUsers
      .filter((user) => !alreadyMappedUserIds.has(user.id))
      .map((user) => ({
        user_id: user.id,
        team_id: teamId,
      }));

    if (mappingsToCreate.length > 0) {
      await prisma.user_team_mappings.createMany({
        data: mappingsToCreate,
        skipDuplicates: true, 
      });
    }

    const defaultRoleId = 5;

      const roleMappings = mappingsToCreate.map((m) => ({
        user_id: m.user_id,
        role_id: defaultRoleId,
        team_id: teamId,
      }));

      await prisma.user_team_role.createMany({
        data: roleMappings,
        skipDuplicates: true,
      });

    let message = "Members added successfully";
    let status = "success";
    if(mappingsToCreate.length === 0)
    {
      message = "User already exists.";
      status = "warning";
    }
    else if(mappingsToCreate.length === 1)
    {
      message = "Member added successfully.";
    }

    return NextResponse.json({
        message: message,
        added: mappingsToCreate.length,
        status: status
      });
    } catch (error) {
      console.error("Add members error:", error);
      return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
  }
