"use server";

import { prisma } from "@/prisma";

export async function getRoles(userId: string) {
    const userDetails = await prisma.users.findUnique({
        where: { id: Number(userId) },
        include: { roles: true },
    });

    if (!userDetails) throw new Error("User not found");

    return userDetails.roles;
}

export async function getDashboardData(userId: string) {
    return userId;
}

async function getTeams(userId: string) {
    const userTeams = await prisma.user_team_mappings.findMany({
        where: {
            user_id: Number(userId),
        },
    });

    const teams = await prisma.teams.findMany({
        where: {
            id: {
                in: userTeams.map((team) => team.team_id),
            }
        }
    });

    return teams;
}

