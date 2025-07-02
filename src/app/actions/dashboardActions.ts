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

export async function isUserManager(userId: string, teamId?: number) {
  interface WhereClause {
    user_id: number;
    roles: {
      role_name: {
        equals: string;
        mode: "insensitive";
      };
    };
    team_id?: number;
  }

  const whereClause: WhereClause = {
    user_id: Number(userId),
    roles: {
      role_name: {
        equals: "Manager",
        mode: "insensitive"
      }
    }
  };

  if (teamId) {
    whereClause.team_id = teamId;
  }

  const managerRole = await prisma.user_team_role.findFirst({
    where: whereClause,
    include: {
      roles: true
    }
  });

  return !!managerRole;
}

export async function getUserRoles(userId: string) {
  const userRoles = await prisma.user_team_role.findMany({
    where: {
      user_id: Number(userId),
    },
    include: {
      roles: true,
      teams: true
    }
  });

  return userRoles;
}

export async function hasTeamPermission(userId: string, teamId: number, requiredRole: 'admin' | 'manager' | 'member' = 'member') {
  const isAdmin = await isUserAdmin(userId);
  if (isAdmin) return true;

  if (requiredRole === 'admin') return false;

  const userTeamRole = await prisma.user_team_role.findFirst({
    where: {
      user_id: Number(userId),
      team_id: teamId,
    },
    include: {
      roles: true
    }
  });

  if (!userTeamRole) return false;

  const roleName = userTeamRole.roles.role_name.toLowerCase();
  
  if (requiredRole === 'manager') {
    return roleName === 'manager';
  }
  
  if (requiredRole === 'member') {
    return roleName === 'member' || roleName === 'manager';
  }

  return false;
}

export async function UserExists(userId: string){
  const user = await prisma.users.findUnique({
    where: { id: Number(userId), is_active: true },
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
      is_active: true
    },
    orderBy: { id: "asc" },
  });

  return users;
}