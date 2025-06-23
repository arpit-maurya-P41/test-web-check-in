import { Dayjs } from "dayjs";
import { teams } from "@prisma/client";

export type Goal = {
    goal_text: string;
    is_smart: boolean;
    goal_progress: {
        is_met: boolean;
      }[];
  };
  
  export type CheckinEntry = {
    slack_user_id: string;
    checkin_date: string;
    blocker: string | null;
    feeling: string | null;
    goals: Goal[];
    users: {
        first_name: string;
        last_name: string;
      };
  };

export type FormValues = {
    FirstName: string;
    LastName: string;
    Title: string;
    Location: string;
    timezone: string;
    checkIn: Dayjs;
    checkOut: Dayjs;
    About: string;
    IsAdmin: boolean;
};

export type Role = {
    id: number;
    role_name: string;
}

export type UserTeamMapping = {
    team_id: number;
    teams: teams;
};

export type UserTeamRole = {
    role_id: number;
};

export type User = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    user_team_mappings: UserTeamMapping[];
    user_team_role: UserTeamRole[];
};

export type UserDetail = {
    name : string;
    id : string;
}

export type DashboardData = {
    date: string;
    user: UserDetail;
    percentage: number;
};

export type PercentageData = {
    date: string;
    percentage: number;
};

export type LoginFormValues = {
    username: string;
    password: string;
}

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export type DashboardItem = {
    key: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
};

export type TeamDetailsForm = {
    TeamName: string;
    TeamInfo: string;
    ChannelId: string;
};

export type TeamWithUserCount = {
    name: string;
    id: number;
    slack_channel_id: string;
    is_active: boolean;
    teaminfo: string | null;
    userCount: number
}