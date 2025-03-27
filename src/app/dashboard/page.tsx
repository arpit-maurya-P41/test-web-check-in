"use client";

import { useState, useEffect } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LineChartOutlined,
  LogoutOutlined,
  TeamOutlined,
  UserSwitchOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, DatePicker, Col, Row, Space, Select } from 'antd';

import dayjs from "dayjs";
import NotificationCard from "./NotificationCard";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Header, Sider, Content } = Layout;
const getDefaultDates = () => [dayjs().subtract(6, "day"), dayjs()];

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);

  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setData] = useState([]);
  const [dates, setDates] = useState(getDefaultDates());
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleTeamChange = (value) => {
    setSelectedTeams(value);
  };

  const handleUserChange = (value) => {
    setSelectedUsers(value);
  };


  const handleRangeChange = (values) => {
    if (values === null) {
      // If cleared, reset to default
      const defaultDates = getDefaultDates();
      setDates(defaultDates);
    } else {
      setDates(values);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams();
      const formatted = dates.map((d) => d.format("YYYY-MM-DD"));
      const [startDate, endDate] = formatted;

      params.append("startDate", startDate);
      params.append("endDate", endDate);

      if (selectedTeams.length > 0) {
        params.append("teams", selectedTeams.join(","));
      }

      if (selectedUsers.length > 0) {
        params.append("users", selectedUsers.join(","));
      }

      const [dashboardRes, teamsRes, usersRes] = await Promise.all([
        fetch(`/api/dashboard?${params.toString()}`),
        fetch("/api/teams"),
        fetch("/api/users")
      ]);

      const data = await dashboardRes.json();
      const teamData = await teamsRes.json();
      const userData = await usersRes.json();

      setUsers(userData.data);
      setTeams(teamData.data);
      setData(JSON.parse(JSON.stringify(data.data)));

      setLoading(false);
    };

    fetchData();
  }, [dates, selectedTeams, selectedUsers]);


  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <Menu
          theme="dark"
          mode="inline"
          style={{ flex: 1 }}
          defaultSelectedKeys={['dashboard']}
          items={[
            { key: 'dashboard', icon: <LineChartOutlined />, label: 'Dashboard' },
            // { key: 'teamManagement', icon: <TeamOutlined />, label: 'Teams', onClick: () => window.location.href = '/team-management' },
            // { key: "userManagement", icon: <UserSwitchOutlined />, label: "Users", onClick: () => window.location.href = "/user-managment" }
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />

          <Button
            type="text"
            icon={<LogoutOutlined />}
            // TODO: Add onclick handler onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
              position: 'absolute',
              right: 0,
            }}
          />
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}

        >
          {
            loading ? "Loading..." : <>
              <Row>
                <Col span={26} style={{ margin: "auto" }}>
                  <Space
                    style={{ marginBottom: 16, display: "flex" }}
                    wrap
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <RangePicker
                        onChange={handleRangeChange}
                        value={dates}
                        format="YYYY-MM-DD"
                        style={{
                          padding: "8px",
                          borderRadius: "8px",
                        }}
                        allowClear
                      />
                    </div>

                    <Select
                      mode="multiple"
                      allowClear
                      placeholder="Select Teams"
                      value={selectedTeams}
                      onChange={handleTeamChange}
                      style={{ minWidth: 240 }}
                    >
                      {teams.map((team) => (
                        <Option key={team.id} value={team.slack_channel_id}>
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
                      style={{ minWidth: 240 }}
                    >
                      {users.map((user) => (
                        <Option key={user.id} value={user.slack_user_id}>
                          {user.email}
                        </Option>
                      ))}
                    </Select>
                  </Space>
                </Col>
              </Row>
              <Row>
                {
                  dashboardData.map((data, index) => (
                    <Col span={24} key={index} style={{ padding: 8 }}>
                      <NotificationCard data={data} />
                    </Col>
                  ))
                }
              </Row>
            </>
          }
        </Content>
      </Layout>
    </Layout>
  );
}
