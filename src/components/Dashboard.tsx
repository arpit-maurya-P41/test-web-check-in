"use client";

import { useEffect, useState } from "react";
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    LogoutOutlined,
} from "@ant-design/icons";
import {
    Button,
    Layout,
    theme,
    DatePicker,
    Col,
    Row,
    Space,
    Select,
} from "antd";

import dayjs, { Dayjs } from "dayjs";
import { RangePickerProps } from "antd/lib/date-picker";
import Sidebar from "@/components/Sidebar";
import { roles, teams, users } from "@prisma/client";
import { logoutUser } from "@/app/actions/authActions";

import { Heatmap } from "@ant-design/charts";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Header, Content } = Layout;
const getDefaultDates = () => [dayjs().subtract(6, "day"), dayjs()] as [Dayjs, Dayjs];

type Props = {
    userId: string;
    roles: roles;
    teams: teams[];
    users: users[];
};

type DashboardData = {
    date: string;
    user: string;
    smartGoalsRate: number;
};

const Dashboard: React.FC<Props> = ({ roles, teams, users }) => {
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    const [collapsed, setCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData[]>([]);
    const [dates, setDates] = useState<[Dayjs, Dayjs]>(getDefaultDates());
    const [selectedTeams, setSelectedTeams] = useState<string>(teams[0]?.slack_channel_id);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const handleTeamChange = (value: string) => setSelectedTeams(value ?? teams[0]?.slack_channel_id);
    const handleUserChange = (value: never[]) => setSelectedUsers(value);
    const handleRangeChange = (dates: RangePickerProps["value"]) => {
        if (dates) setDates(dates as [Dayjs, Dayjs]);
        else setDates(getDefaultDates());
    }

    const config = {
        data: dashboardData,
        xField: "date",
        yField: "user",
        colorField: "smartGoalsRate",
        mark: "cell",
        style: { inset: 0.5 },
        scale: {
            size: { range: [0, 100] },
            color: { range: ["#62bb45", "#b1d34a", "#f15b3f", "#ffc20c", "#f58220"] },
        },
        label: {
            text: (d: DashboardData) => d.smartGoalsRate,
            position: "inside",
            style: {
                fill: "#fff",
                shadowBlur: 2,
                shadowColor: "rgba(0, 0, 0, .45)",
                pointerEvents: "none",
            },
        },
        autoFit: true,
    };


    useEffect(() => {
        const fetchData = async () => {
            const params = new URLSearchParams();
            const formatted = dates.map((d) => d.format("YYYY-MM-DD"));
            const [startDate, endDate] = formatted;

            params.append("startDate", startDate);
            params.append("endDate", endDate);

            if (selectedTeams) {
                params.append("teamChannelId", selectedTeams.toString());
            }

            if (selectedUsers.length > 0) {
                params.append("users", selectedUsers.join(","));
            }

            const [dashboardRes] = await Promise.all([
                fetch(`/api/dashboard?${params.toString()}`),
            ]);

            const data = await dashboardRes.json();
            setDashboardData(JSON.parse(JSON.stringify(data.formattedCheckins)));
            setLoading(false);
        };

        fetchData();
    }, [dates, selectedTeams, selectedUsers]);

    return (
        <Layout>
            <Sidebar
                collapsed={collapsed}
                canManageTeams={roles.can_manage_teams}
                canManageUsers={roles.can_manage_users}
                canViewReports={roles.can_view_reports}
                canManageRoles={roles.can_manage_roles}
                activeKey="dashboard"
            />
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }}>
                    <Button
                        type="text"
                        icon={
                            collapsed ? (
                                <MenuUnfoldOutlined />
                            ) : (
                                <MenuFoldOutlined />
                            )
                        }
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            fontSize: "16px",
                            width: 64,
                            height: 64,
                        }}
                    />

                    <Button
                        type="text"
                        icon={<LogoutOutlined />}
                        onClick={() => logoutUser()}
                        style={{
                            fontSize: "16px",
                            width: 64,
                            height: 64,
                            position: "absolute",
                            right: 0,
                        }}
                    />
                </Header>
                <Content
                    style={{
                        margin: "24px 16px",
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                        display: "flex",
                        flexDirection: "column",
                        gap: 16,
                    }}>
                    {loading ? (
                        "Loading..."
                    ) : (
                        <>
                            <Row>
                                <Col
                                    span={26}
                                    style={{ margin: "auto" }}>
                                    <Space
                                        style={{
                                            marginBottom: 16,
                                            display: "flex",
                                        }}
                                        wrap>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 12,
                                            }}>
                                            <RangePicker
                                                onChange={(dates: RangePickerProps["value"]) => handleRangeChange(dates)}
                                                value={dates}
                                                format="YYYY-MM-DD"
                                                style={{
                                                    padding: "8px",
                                                    borderRadius: "8px",
                                                }}
                                                allowClear
                                                maxDate={dayjs()}
                                            />
                                        </div>

                                        <Select
                                            placeholder="Select Teams"
                                            value={selectedTeams}
                                            onChange={handleTeamChange}
                                            style={{ minWidth: 240 }}>
                                            {teams.map((team) => (
                                                <Option
                                                    key={team.slack_channel_id}
                                                    value={team.slack_channel_id}>
                                                    {team.name}
                                                </Option>
                                            ))}
                                        </Select>

                                        <Select
                                            mode="multiple"
                                            allowClear
                                            placeholder="Select Users"
                                            value={selectedUsers}
                                            onChange={handleUserChange}
                                            style={{ minWidth: 240 }}>
                                            {users.map((user) => (
                                                <Option
                                                    key={user.id}
                                                    value={user.slack_user_id}>
                                                    {user.email}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Space>
                                </Col>
                            </Row>
                            {/* <Row>
                                {dashboardData.map((data, index) => (
                                    <Col
                                        span={24}
                                        key={index}
                                        style={{ padding: 8 }}>
                                        <NotificationCard data={data} />
                                    </Col>
                                ))}
                            </Row> */}
                            <Row>
                                <Col
                                    span={24}
                                    style={{ padding: 8 }}>
                                    <Heatmap {...config} />
                                </Col>
                            </Row>
                        </>
                    )}
                </Content>
            </Layout>
        </Layout>
    );
}

export default Dashboard;