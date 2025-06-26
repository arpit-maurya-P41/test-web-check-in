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
  Typography,
} from "antd";

import dayjs, { Dayjs } from "dayjs";
import { RangePickerProps } from "antd/lib/date-picker";
import Sidebar from "@/components/Sidebar";
import { logoutUser } from "@/app/actions/authActions";
import { useSidebarStore } from "@/store/sidebarStore";

import { Heatmap } from "@ant-design/charts";
import PercentageLineChart from "./PercentageLineChart";
import { DashboardProps } from "@/type/PropTypes";
import { DashboardData, PercentageData, DashboardApiResponse } from "@/type/types";
import { getTeamUsers } from "@/app/actions/dashboardActions";
import { users } from "@prisma/client";
import { useFetch } from "@/utils/useFetch";

const { Title } = Typography;

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Header, Content } = Layout;
const getDefaultDates = () =>
  [dayjs().subtract(6, "day"), dayjs()] as [Dayjs, Dayjs];

const Dashboard: React.FC<DashboardProps> = ({
  userId,
  teams,
  isAdmin,
}) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { sidebarCollapsed, toggleSidebar } = useSidebarStore();
  const [dashboardData, setDashboardData] = useState<DashboardData[]>([]);
  const [dates, setDates] = useState<[Dayjs, Dayjs]>(getDefaultDates());
  const [selectedTeams, setSelectedTeams] = useState<string>(
    teams[0]?.slack_channel_id
  );
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [blockedData, setBlockedData] = useState<PercentageData[]>([]);
  const [checkinData, setCheckinData] = useState<PercentageData[]>([]);
  const [usersData, setUsersData] = useState<users[]>([]);

  const handleTeamChange = async (value: string) => {
    setSelectedTeams(value ?? teams[0]?.slack_channel_id);
    const selectedTeam = teams.find((t) => t.slack_channel_id === value);
    const teamId = selectedTeam?.id;

    if (teamId) {
      const teamUsers = await getTeamUsers(teamId);
      setUsersData(teamUsers);
    }
  };
  
  const handleUserChange = (value: string[]) => setSelectedUsers(value);
  const handleRangeChange = (dates: RangePickerProps["value"]) => {
    if (dates) setDates(dates as [Dayjs, Dayjs]);
    else setDates(getDefaultDates());
  };

  const buildQueryParams = () => {
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

    return params.toString();
  };

  const { data: dashboardApiData } = useFetch<DashboardApiResponse>(
    `/api/dashboard?${buildQueryParams()}`,
    {
      dependencies: [dates, selectedTeams, selectedUsers]
    }
  );

  useEffect(() => {
    if (dashboardApiData) {
      setDashboardData(JSON.parse(JSON.stringify(dashboardApiData.smartCheckins || [])));
      setBlockedData(JSON.parse(JSON.stringify(dashboardApiData.blockedUsersCount || [])));
      setCheckinData(JSON.parse(JSON.stringify(dashboardApiData.checkinUserPercentageByDate || [])));
    }
  }, [dashboardApiData]);

  useEffect(() => {
    const fetchInitialUsers = async () => {
      const defaultTeam = teams[0];
      if (defaultTeam?.id) {
        const teamUsers = await getTeamUsers(defaultTeam.id);
        setUsersData(teamUsers);
      }
    };
    fetchInitialUsers();
  }, [teams]);

  const config = {
    data: dashboardData,
    xField: "date",
    yField: (d: DashboardData) => d.user.id,
    colorField: "percentage",
    mark: "cell",
    style: { inset: 0.5 },
    scale: {
      size: { range: [0, 100] },
      color: {
        type: "threshold",
        domain: [0, 20, 40, 60, 80, 100],
        range: [
          "#7a0000",
          "#e63946",
          "#f28c28",
          "#d4aa00",
          "#a8c66c",
          "#4caf50",
        ],
        unknown: "#D3D3D3",
      },
    },
    axis: {
      y: {
        labelFormatter: (id: string) => {
          const user = dashboardData.find((d) => d.user.id === id);
          return user ? user.user.name : id;
        },
      },
    },
    label: {
      text: (d: DashboardData) =>
        d.percentage === null ? "" : `${d.percentage}`,
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

  return (
    <Layout>
      <Sidebar
        activeKey="dashboard"
        userId={userId}
        isAdmin={isAdmin}
      />
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
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
          }}
        >
          <Row>
            <Col span={26} style={{ margin: "auto" }}>
              <Space
                style={{
                  marginBottom: 16,
                  display: "flex",
                }}
                wrap
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <RangePicker
                    onChange={(dates: RangePickerProps["value"]) =>
                      handleRangeChange(dates)
                    }
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
                  style={{ minWidth: 240 }}
                >
                  {teams.map((team) => (
                    <Option
                      key={team.slack_channel_id}
                      value={team.slack_channel_id}
                    >
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
                  style={{ minWidth: 240, maxWidth: 500 }}
                >
                  {usersData.map((user) => (
                    <Option key={user.id} value={user.id}>
                      {user.email}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ padding: 8 }}>
              <Title level={2}>Smart Goals</Title>
              {config.data && config.data.length > 0 ? (
                <Heatmap {...config} />
              ) : (
                <div style={{ textAlign: "center", padding: "8rem" }}>
                  No data available
                </div>
              )}
              <Title level={2}>Blockers</Title>
              <PercentageLineChart
                title="Blocked Users Percentage"
                data={blockedData}
                yLabel="Blocked Users (%)"
                color="#f5222d"
              />
              <Title level={2}>Participation</Title>
              <PercentageLineChart
                title="Check-in Users Percentage"
                data={checkinData}
                yLabel="Check-in Users (%)"
                color="#52c41a"
              />
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
