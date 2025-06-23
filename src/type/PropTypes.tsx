import { teams, users } from "@prisma/client";

export type Props = {
    userId: string;
}

export type teamProfileProps = {
    userId: string;
    teamId: string;
}

export type CheckinProps = {
    userId: string;
    teams: Team[];
}

export type Team = {
    id: number;
    name: string;
    slack_channel_id: string;
    is_active: boolean;
    teaminfo: string| null;
  };

export type DashboardProps = {
    userId: string;
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
    activeKey?: string;
    userId: string;
};