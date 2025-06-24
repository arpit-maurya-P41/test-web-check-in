"use server";

import { prisma } from "@/prisma";

export async function isUserAdmin(userId: string) {
  const user = await prisma.users.findFirst({
    where: {
      id: Number(userId),
    },
    select: {
      is_admin: true,
    },
  });
  const isAdmin = user?.is_admin === true;
  return isAdmin;
}

export async function UserExists(userId: string){
  const user = await prisma.users.findUnique({
    where: { id: Number(userId) },
    select: { id: true },
  });
  return user ? true : false;
}

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