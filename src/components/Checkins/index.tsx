"use client";
import {
  Button,
  Card,
  Dropdown,
  Layout,
  MenuProps,
  theme,
  Row,
  Col,
  Progress,
} from "antd";
import Sidebar from "../Sidebar";
import { useEffect, useState } from "react";
import {
  DownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { logoutUser } from "@/app/actions/authActions";
import { useSidebarStore } from "@/store/sidebarStore";
import "./Checkins.css";
import { CheckinEntry, Goal } from "@/type/types";
import { CheckinProps, Team } from "@/type/PropTypes";
import dayjs, { Dayjs } from "dayjs";
import { useFetch } from "@/utils/useFetch";
import { teams } from "@prisma/client";

// Add type for team data from API
type TeamWithCount = teams & {
  userCount: number;
};

const { Header, Content } = Layout;

const Checkins: React.FC<CheckinProps> = ({
  userId,
  teams,
  isAdmin,
  isManager,
}) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { sidebarCollapsed, toggleSidebar } = useSidebarStore();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [goalsSummary, setGoalsSummary] = useState<CheckinEntry[]>([]);
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [teamMembers, setTeamMembers] = useState<Record<number, number>>({});

  const handlePreviousDay = () => {
    setCurrentDate((prev) => prev.subtract(1, "day"));
  };

  const handleNextDay = () => {
    const nextDay = currentDate.add(1, "day");
    if (nextDay.isBefore(dayjs(), "day") || nextDay.isSame(dayjs(), "day")) {
      setCurrentDate(nextDay);
    }
  };

  const handleToday = () => {
    setCurrentDate(dayjs());
  };

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    const team = teams.find((t) => t.id.toString() === e.key);
    if (team) setSelectedTeam(team);
  };

  const teamMenuItems: MenuProps["items"] = teams.map((team) => ({
    key: team.id,
    label: team.name,
  }));

  const handleAllTeamsClick = () => {
    setSelectedTeam(null);
  };

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    const dateStr = currentDate.format("YYYY-MM-DD");

    if (selectedTeam) {
      params.append("teamChannelId", selectedTeam.slack_channel_id);
    }
    params.append("startDate", dateStr);
    params.append("endDate", dateStr);

    return params.toString();
  };

  const { data: checkinsData } = useFetch<CheckinEntry[]>(
    `/api/checkins?${buildQueryParams()}`,
    {
      dependencies: [selectedTeam, currentDate],
    }
  );

  useEffect(() => {
    if (checkinsData) {
      setGoalsSummary(JSON.parse(JSON.stringify(checkinsData)));
    }
  }, [checkinsData]);

  // Fetch team members count when component mounts or when selected team changes
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch("/api/teams");
        const data = await response.json();
        const memberCounts = data.teams.reduce(
          (acc: Record<number, number>, team: TeamWithCount) => {
            acc[team.id] = team.userCount;
            return acc;
          },
          {}
        );
        setTeamMembers(memberCounts);
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    };

    fetchTeamMembers();
  }, []);

  const groupedByDate = (goalsSummary || []).reduce(
    (
      acc: Record<
        string,
        Record<
          string,
          {
            teamGoals: Record<number, Goal[]>;
            teams: { name: string; id: number; slack_channel_id: string }[];
          }
        >
      >,
      entry
    ) => {
      const date = new Date(entry.checkin_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const fullName = `${entry.users.first_name} ${
        entry.users.last_name ?? ""
      }`;

      if (!acc[date]) acc[date] = {};
      if (!acc[date][fullName]) {
        acc[date][fullName] = {
          teamGoals: {},
          teams: entry.users.user_team_mappings.map((mapping) => mapping.teams),
        };
      }

      // Find the team based on slack_channel_id
      const team = entry.users.user_team_mappings
        .map((mapping) => mapping.teams)
        .find((team) => team.slack_channel_id === entry.slack_channel_id);

      const teamId = team?.id;
      if (teamId && !acc[date][fullName].teamGoals[teamId]) {
        acc[date][fullName].teamGoals[teamId] = [];
      }
      if (teamId) {
        acc[date][fullName].teamGoals[teamId].push(...entry.goals);
      }

      return acc;
    },
    {}
  );

  const isToday = currentDate.isSame(dayjs(), "day");
  const isFutureDate = currentDate.isAfter(dayjs(), "day");

  const calculateDaySummary = (
    users: Record<
      string,
      {
        teamGoals: Record<number, Goal[]>;
        teams: { name: string; id: number; slack_channel_id: string }[];
      }
    >
  ) => {
    // Get total members based on selected team or all teams
    let totalMembers = 0;
    if (selectedTeam) {
      totalMembers = teamMembers[selectedTeam.id] || 0;
    } else {
      // Sum up unique members across all teams
      const uniqueMembers = new Set<string>();
      Object.values(users).forEach(({ teams: userTeams }) => {
        userTeams.forEach((team) => {
          if (teamMembers[team.id]) {
            uniqueMembers.add(team.slack_channel_id);
          }
        });
      });
      totalMembers = Object.values(teamMembers).reduce(
        (sum, count) => sum + count,
        0
      );
    }

    // Count participating users for the selected team or all teams
    const participatingUsers = Object.entries(users).filter(([, userData]) => {
      if (selectedTeam) {
        return userData.teams.some((team) => team.id === selectedTeam.id);
      }
      return true;
    }).length;

    // Calculate absences
    const absentUsers = Math.max(0, totalMembers - participatingUsers);

    // Count SMART goals
    let smartGoalUsers = 0;
    Object.entries(users).forEach(([, userData]) => {
      if (
        selectedTeam &&
        !userData.teams.some((team) => team.id === selectedTeam.id)
      ) {
        return;
      }
      const hasSmartGoal = Object.values(userData.teamGoals).some((goals) =>
        goals.some((goal) => goal.is_smart)
      );
      if (hasSmartGoal) smartGoalUsers++;
    });

    return {
      totalMembers,
      participatingUsers,
      absentUsers,
      smartGoalUsers,
      participationRate:
        totalMembers > 0 ? (participatingUsers / totalMembers) * 100 : 0,
      smartGoalRate:
        participatingUsers > 0
          ? (smartGoalUsers / participatingUsers) * 100
          : 0,
    };
  };

  return (
    <Layout>
      <Sidebar
        activeKey="checkins"
        userId={userId}
        isAdmin={isAdmin}
        isManager={isManager}
      />
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              padding: "0 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <Button
                type="text"
                icon={
                  sidebarCollapsed ? (
                    <MenuUnfoldOutlined />
                  ) : (
                    <MenuFoldOutlined />
                  )
                }
                onClick={toggleSidebar}
                style={{ fontSize: 16, width: 48, height: 48 }}
              />
              <span
                style={{
                  fontWeight: 500,
                  cursor: "pointer",
                  fontSize: "16px",
                  color: selectedTeam ? "#1890ff" : "black",
                }}
                onClick={handleAllTeamsClick}
              >
                All Teams
              </span>

              <Dropdown
                menu={{ items: teamMenuItems, onClick: handleMenuClick }}
                trigger={["click"]}
              >
                <Button type="text" style={{ fontSize: 16 }}>
                  {selectedTeam?.name || "Select Team"} <DownOutlined />
                </Button>
              </Dropdown>

              {/* Date Navigation */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  border: "1px solid #d9d9d9",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  height: "2rem",
                }}
              >
                <Button
                  type="text"
                  icon={<LeftOutlined />}
                  onClick={handlePreviousDay}
                  style={{ padding: "4px 8px" }}
                />

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "14px", fontWeight: 500 }}>
                    {currentDate.format("MMM DD, YYYY")}
                  </div>
                </div>

                <Button
                  type="text"
                  icon={<RightOutlined />}
                  onClick={handleNextDay}
                  disabled={isFutureDate}
                  style={{ padding: "4px 8px" }}
                />
              </div>

              <Button
                type="primary"
                size="small"
                onClick={handleToday}
                disabled={isToday}
                style={{ fontSize: "12px", height: "1.8rem" }}
              >
                Today
              </Button>
            </div>

            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={() => logoutUser()}
              style={{ fontSize: 16, width: 48, height: 48 }}
            />
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 16,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {Object.entries(groupedByDate).length > 0 ? (
            Object.entries(groupedByDate).map(([date, users]) => {
              const summary = calculateDaySummary(users);
              return (
                <>
                  {/* Day Summary Section */}
                  <Card
                    style={{
                      marginBottom: 24,
                      backgroundColor: "#fafafa",
                      border: "1px solid #f0f0f0",
                    }}
                  >
                    <Row gutter={[24, 24]}>
                      <Col xs={24} sm={8}>
                        <div style={{ textAlign: "center" }}>
                          <Progress
                            type="circle"
                            percent={Math.round(summary.participationRate)}
                            format={() => (
                              <div>
                                <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                                  {summary.participatingUsers}
                                </div>
                                <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                                  of {summary.totalMembers}
                                </div>
                              </div>
                            )}
                          />
                          <div style={{ marginTop: "12px", fontWeight: "500" }}>
                            Participation
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div style={{ textAlign: "center" }}>
                          <Progress
                            type="circle"
                            percent={100}
                            format={() => (
                              <div>
                                <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                                  {summary.absentUsers}
                                </div>
                                <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                                  members
                                </div>
                              </div>
                            )}
                            status="exception"
                          />
                          <div style={{ marginTop: "12px", fontWeight: "500" }}>
                            Absences
                          </div>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div style={{ textAlign: "center" }}>
                          <Progress
                            type="circle"
                            percent={Math.round(summary.smartGoalRate)}
                            format={() => (
                              <div>
                                <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                                  {summary.smartGoalUsers}
                                </div>
                                <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
                                  of {summary.participatingUsers}
                                </div>
                              </div>
                            )}
                            status="active"
                          />
                          <div style={{ marginTop: "12px", fontWeight: "500" }}>
                            SMART Goals
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                  <Card
                    key={date}
                    style={{
                      border: "1px solid #eee",
                      padding: "16px",
                      borderRadius: 8,
                      backgroundColor: "#fff",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    <h2 style={{ marginBottom: 16 }}>{date}</h2>
                    {/* Existing user entries */}
                    {Object.entries(users).map(
                      ([fullName, { teamGoals, teams }]) => (
                        <div key={fullName} style={{ marginBottom: 24 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: 16,
                              backgroundColor: "#f8f9fa",
                              padding: "12px",
                              borderRadius: "8px",
                            }}
                          >
                            <span style={{ marginRight: 8, fontSize: 18 }}>
                              👤
                            </span>
                            <strong style={{ fontSize: 16 }}>{fullName}</strong>
                          </div>
                          {teams.map((team) => (
                            <div key={team.id} style={{ marginBottom: 20 }}>
                              <div
                                style={{
                                  marginBottom: "12px",
                                }}
                              >
                                <span
                                  style={{
                                    color: "#595959",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    backgroundColor: "#f5f5f5",
                                    padding: "4px 12px",
                                    borderRadius: "6px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  🏢 {team.name}
                                </span>
                              </div>
                              {teamGoals[team.id]?.length > 0 ? (
                                <ul
                                  style={{
                                    paddingLeft: 20,
                                    margin: 0,
                                    listStyle: "none",
                                  }}
                                >
                                  {teamGoals[team.id].map((goal, idx) => (
                                    <li
                                      key={idx}
                                      style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "8px",
                                        backgroundColor: "#fff",
                                      }}
                                    >
                                      <span style={{ marginTop: "2px" }}>
                                        •
                                      </span>
                                      <span style={{ flex: 1 }}>
                                        {goal.goal_text}{" "}
                                        {goal.goal_progress?.length > 0 &&
                                          (goal.goal_progress[0].is_met
                                            ? "✅"
                                            : "❌")}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p
                                  style={{
                                    margin: "0 0 0 20px",
                                    color: "#666",
                                  }}
                                >
                                  No goals for this team.
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </Card>
                </>
              );
            })
          ) : (
            <Card
              style={{
                border: "1px solid #eee",
                padding: "16px",
                borderRadius: 8,
                backgroundColor: "#fff",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                textAlign: "center",
              }}
            >
              <div
                style={{ fontSize: "16px", color: "#666", marginBottom: "8px" }}
              >
                No check-ins found for {currentDate.format("MMM DD, YYYY")}
              </div>
              <div style={{ fontSize: "14px", color: "#999" }}>
                {isToday
                  ? "No one has checked in today yet."
                  : "No check-ins were recorded on this date."}
              </div>
            </Card>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Checkins;
