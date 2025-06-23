"use server";

import { prisma } from "@/prisma";


export async function getDashboardData(userId: string) {
    await getTeams(userId);
    return userId;
}

export async function getTeams(userId: string) {
    const userTeams = await prisma.user_team_mappings.findMany({
        where: {
            user_id: Number(userId),
        },
    });

    const teams = await prisma.teams.findMany({
        where: {
            id: {
                in: userTeams.map((team) => team.team_id),
            },
        },
        orderBy: { id: "asc" },
    });

    return teams;
}

export async function getTeamUsers(teamId: number) {
    const teamUsers = await prisma.user_team_mappings.findMany({
        where: {
            team_id: teamId,
        },
    });

    const users = await prisma.users.findMany({
        where: {
            id: {
                in: teamUsers.map((user) => user.user_id),
            },
        },
        orderBy: { id: "asc" },
    });

    return users;
}