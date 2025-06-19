import { roles, teams, users } from "@prisma/client";

export type Props = {
    userId: string;
    roles: roles
}

export type CheckinProps = {
    userId: string;
    roles: roles;
    teams: Team[];
}

export type Team = {
    id: number;
    name: string;
    slack_channel_id: string;
    is_active: boolean;
  };

export type DashboardProps = {
    userId: string;
    roles: roles;
    teams: teams[];
    users: users[];
};

export type LineChartProps = {
    title: string;
    data: PercentageDataPoint[];
    yLabel?: string;
    color?: string;
};

export type PercentageDataPoint = {
    date: string;
    percentage: number;
};  

export type SidebarProps = {
    collapsed: boolean;
    canManageTeams: boolean;
    canManageUsers: boolean;
    canViewReports: boolean;
    canManageRoles: boolean;
    activeKey: string;
    userId: string;
};