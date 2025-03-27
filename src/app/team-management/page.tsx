"use client";

import { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LineChartOutlined,
  LogoutOutlined,
  TeamOutlined,
  UserSwitchOutlined
} from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";

const { Header, Sider, Content } = Layout;

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);

  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <Menu
          theme="dark"
          mode="inline"
          style={{ flex: 1 }}
          defaultSelectedKeys={["teamManagement"]}
          items={[
            { key: "dashboard", icon: <LineChartOutlined />, label: "Dashboard", onClick: () => window.location.href = "/dashboard" },
            { key: "teamManagement", icon: <TeamOutlined />, label: "Teams"},
            { key: "userManagement", icon: <UserSwitchOutlined />, label: "Users", onClick: () => window.location.href = "/user-managment" },
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
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />

          <Button
            type="text"
            icon={<LogoutOutlined />}
            // TODO: Add onclick handler onClick={() => setCollapsed(!collapsed)}
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
          Team Management
        </Content>
      </Layout>
    </Layout>
  );
}
