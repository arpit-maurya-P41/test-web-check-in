import { teams } from "@prisma/client";

export type UserProps = {
    userId: string;
    isAdmin: boolean;
}

export type ProfileProps = {
    userId: string;
    isAdmin: boolean;
}

export type TeamProps = {
    userId: string;
    isAdmin: boolean;
}

export type teamProfileProps = {
    userId: string;
    teamId: string;
    isAdmin: boolean;
}

export type CheckinProps = {
    userId: string;
    teams: Team[];
    isAdmin: boolean;
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
    isAdmin: boolean;
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
    activeKey?: string;
    userId: string;
    isAdmin?: boolean;
};