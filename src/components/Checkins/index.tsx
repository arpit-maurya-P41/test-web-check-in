'use client'
import { Button, Card, Dropdown, Layout, MenuProps, theme } from "antd";
import Sidebar from "../Sidebar";
import { useEffect, useState } from "react";
import { DownOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { logoutUser } from "@/app/actions/authActions";
import { useSidebarStore } from "@/store/sidebarStore";
import "./Checkins.css";
import { CheckinEntry, Goal} from "@/type/types";
import { CheckinProps, Team } from "@/type/PropTypes";
import { useFetch } from "@/utils/useFetch";

const { Header, Content } = Layout;

const Checkins: React.FC<CheckinProps> = ({ userId, teams, isAdmin }) => {
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
    const { sidebarCollapsed, toggleSidebar } = useSidebarStore();
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [goalsSummary, setGoalsSummary] = useState<CheckinEntry[]>([]);

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        const team = teams.find((t) => t.id.toString() === e.key);
        if (team) setSelectedTeam(team);
    };

    const teamMenuItems: MenuProps['items'] = teams.map((team) => ({
        key: team.id,
        label: team.name,
    }));

    const handleAllTeamsClick = () => {
        setSelectedTeam(null);
    };

    const url = selectedTeam
        ? `/api/checkins?teamChannelId=${selectedTeam.slack_channel_id}`
        : `/api/checkins`;

    const { data: checkinsData } = useFetch<CheckinEntry[]>(url, {
        dependencies: [selectedTeam]
    });

    useEffect(() => {
        if (checkinsData) {
            setGoalsSummary(JSON.parse(JSON.stringify(checkinsData)));
        }
    }, [checkinsData]);

    const groupedByDate = (goalsSummary || []).reduce(
        (acc: Record<string, Record<string, Goal[]>>, entry) => {
          const date = new Date(entry.checkin_date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
            });
          const fullName = `${entry.users.first_name} ${entry.users.last_name ?? ""}`;

          if (!acc[date]) acc[date] = {};
          if (!acc[date][fullName]) acc[date][fullName] = [];

            acc[date][fullName].push(...entry.goals);
            return acc;
        },
        {}
      );

    return(
        <Layout>
            <Sidebar
                activeKey="checkins"
                userId={userId}
                isAdmin={isAdmin}
            />
            <Layout>
            <Header style={{ padding: 0, background: colorBgContainer }}>
            <div
                style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "0 16px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
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

                <Dropdown menu={{ items: teamMenuItems, onClick: handleMenuClick }} trigger={['click']}>
                    <Button type="text" style={{ fontSize: 16 }}>
                    {selectedTeam?.name || "Select Team"} <DownOutlined />
                    </Button>
                </Dropdown>
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
            {Object.entries(groupedByDate).map(([date, users]) => (
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
                {Object.entries(users).map(([fullName, goals]) => (
                    <div key={fullName} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ marginRight: 8, fontSize: 18 }}>👤</span>
                        <strong style={{ fontSize: 16 }}>{fullName}</strong>
                    </div>
                    {goals.length > 0 ? (
                        <ul style={{ paddingLeft: 20 }}>
                        {goals.map((goal, idx) => (
                            <li key={idx}>
                            {goal.goal_text}{" "}
                            {goal.goal_progress?.length > 0 && (goal.goal_progress[0].is_met ? "✅" : "❌")}
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p>No goals.</p>
                    )}
                    </div>
                ))}
                </Card>
            ))}
            </Content>
            </Layout>
        </Layout>
    )
}

export default Checkins;
