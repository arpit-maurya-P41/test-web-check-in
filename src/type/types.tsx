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
};

export type Role = {
    id: number;
    role_name: string;
}

export type UserTeamMapping = {
    team_id: number;
    teams: teams;
};

export type User = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    slack_user_id: string;
    user_team_mappings: UserTeamMapping[];
    roles: Role;
    timezone: string;
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