"use client";
import {
  Button,
  Card,
  Dropdown,
  Layout,
  MenuProps,
  theme,
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

const { Header, Content } = Layout;

const Checkins: React.FC<CheckinProps> = ({ userId, teams, isAdmin, isManager }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { sidebarCollapsed, toggleSidebar } = useSidebarStore();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [goalsSummary, setGoalsSummary] = useState<CheckinEntry[]>([]);
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  
  const handlePreviousDay = () => {
    setCurrentDate(prev => prev.subtract(1, 'day'));
  };

  const handleNextDay = () => {
    const nextDay = currentDate.add(1, 'day');
    if (nextDay.isBefore(dayjs(), 'day') || nextDay.isSame(dayjs(), 'day')) {
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
      dependencies: [selectedTeam, currentDate]
    }
  );

  useEffect(() => {
    if (checkinsData) {
      setGoalsSummary(JSON.parse(JSON.stringify(checkinsData)));
    }
  }, [checkinsData]);

  const groupedByDate = (goalsSummary || []).reduce(
    (acc: Record<string, Record<string, { teamGoals: Record<number, Goal[]>; teams: { name: string; id: number; slack_channel_id: string; }[] }>>, entry) => {
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
          teams: entry.users.user_team_mappings.map(mapping => mapping.teams)
        };
      }

      // Find the team based on slack_channel_id
      const team = entry.users.user_team_mappings
        .map(mapping => mapping.teams)
        .find(team => team.slack_channel_id === entry.slack_channel_id);
      
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

  const isToday = currentDate.isSame(dayjs(), 'day');
  const isFutureDate = currentDate.isAfter(dayjs(), 'day');

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
                icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
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
                  height: "2rem"
                }}
              >

                <Button
                  type="text"
                  icon={<LeftOutlined />}
                  onClick={handlePreviousDay}
                  style={{ padding: "4px 8px" }}
                />
                
                <div style={{ textAlign: "center"}}>
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
            Object.entries(groupedByDate).map(([date, users]) => (
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
                {Object.entries(users).map(([fullName, { teamGoals, teams }]) => (
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
                      <span style={{ marginRight: 8, fontSize: 18 }}>👤</span>
                      <strong style={{ fontSize: 16 }}>{fullName}</strong>
                    </div>
                    {teams.map((team) => (
                      <div key={team.id} style={{ marginBottom: 20 }}>
                        <div style={{ 
                          marginBottom: "12px"
                        }}>
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
                              gap: "4px"
                            }}
                          >
                            🏢 {team.name}
                          </span>
                        </div>
                        {teamGoals[team.id]?.length > 0 ? (
                          <ul style={{ 
                            paddingLeft: 20,
                            margin: 0,
                            listStyle: "none"
                          }}>
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
                                <span style={{ marginTop: "2px" }}>•</span>
                                <span style={{ flex: 1 }}>
                                  {goal.goal_text}{" "}
                                  {goal.goal_progress?.length > 0 &&
                                    (goal.goal_progress[0].is_met ? "✅" : "❌")}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p style={{ margin: "0 0 0 20px", color: "#666" }}>No goals for this team.</p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </Card>
            ))
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
              <div style={{ fontSize: "16px", color: "#666", marginBottom: "8px" }}>
                No check-ins found for {currentDate.format("MMM DD, YYYY")}
              </div>
              <div style={{ fontSize: "14px", color: "#999" }}>
                {isToday ? "No one has checked in today yet." : "No check-ins were recorded on this date."}
              </div>
            </Card>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Checkins;
