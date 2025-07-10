import { Dayjs } from "dayjs";
import { teams } from "@prisma/client";
import React from "react";

// UseFetch hook options
export type UseFetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  dependencies?: React.DependencyList;
  skipOnMount?: boolean;
}

export type LoadingState = {
  isLoading: boolean;
  activeRequests: number;
  isNavigating: boolean;
  navigationStartTime: number | null;
}

export type LoadingEvent = {
  type: 'navigation' | 'api' | 'complete';
  timestamp: number;
  duration?: number;
}

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
    slack_channel_id: string;
    goals: Goal[];
    users: {
        first_name: string;
        last_name: string;
        user_team_mappings: {
          teams: {
            name: string;
            id: number;
            slack_channel_id: string;
          }
        }[];
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
    check_in?: boolean;
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
    team_info: string | null;
    userCount: number
}

// User data in Profile component
export type UserData = {
  title: string;
  first_name: string;
  last_name: string;
  location: string;
  timezone: string;
  check_in_time: string;
  check_out_time: string;
  about_you: string;
  is_admin: boolean;
}

export type EditingRow = {
  id: number;
  method: string;
}

export type TeamRole = {
  id: number;
  role_name: string;
}

export type TeamDetails = {
  name: string;
  team_info: string | null;
  slack_channel_id: string;
}

export type DashboardApiResponse = {
  smartCheckins: DashboardData[];
  blockedUsersCount: PercentageData[];
  checkinUserPercentageByDate: PercentageData[];
}

export type CheckinAPIResponse = {
  date: string;
  teamSummary: {
    totalMembers: number;
    participation: {
      count: number;
      percentage: number;
    };
    blockers: {
      count: number;
      percentage: number;
    };
    smart: {
      totalGoals: number;
      smartGoals: number;
      percentage: number;
    };
  };
  checkedInUsers: Array<{
    user_id: number;
    team_id: number;
    has_checked_in: boolean;
    is_blocked: boolean;
    user: {
      name: string;
      goals: Array<{
        is_smart: boolean;
        goal_text: string;
      }>;
    };
  }>;
  notCheckedInUsers: Array<{
    user_id: number;
    name: string;
  }>;
}