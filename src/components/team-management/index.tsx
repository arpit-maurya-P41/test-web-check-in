"use client";

import React, { useState, useEffect } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import {
  Button,
  Layout,
  theme,
  Table,
  Form,
  Typography,
} from "antd";
import Sidebar from "../Sidebar";
import { logoutUser } from "@/app/actions/authActions";
import { useSidebarStore } from "@/store/sidebarStore";
import "./teams.css";
import { ColumnsType } from "antd/es/table";
import { TeamProps } from "@/type/PropTypes";
import { useRouter } from "next/navigation";
import { TeamWithUserCount } from "@/type/types";

const { Header, Content } = Layout;
const { Title } = Typography;

const TeamManagementIndex: React.FC<TeamProps> = ({ userId, isAdmin }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { sidebarCollapsed, toggleSidebar } = useSidebarStore();

  const [dataSource, setDataSource] = useState<TeamWithUserCount[]>([]);
  const [newTeamId, setNewTeamId] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/teams");
      const data = await response.json();
      setDataSource(data.teams);
      setNewTeamId(data.latestTeamId);

    } catch (error) {
      console.error("Error fetching data", error);
    }
  };

  const handleAdd = () => {
    router.push(`/team-management/${newTeamId}`);
  };

  const columns: ColumnsType<TeamWithUserCount> = [
    {
      title: "Name",
      dataIndex: "name",
      render: (_: unknown, record: TeamWithUserCount) => {
        return (
          <span
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`/team-management/${record.id}`)}
          >
            {record.name}
          </span>
        );
      },
    },
    {
      title: "Members Count",
      dataIndex: "memberscount",
      render: (_: unknown, record: TeamWithUserCount) => {
        return record.userCount;
      },
    },
  ];

  return (
    <Layout>
      <Sidebar
        activeKey="teamManagement"
        userId={userId}
        isAdmin={isAdmin}
      />
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div className="header-container">
            <Button
              type="text"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={toggleSidebar}
              className="header-button"
            />
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={() => logoutUser()}
              className="header-button logout-button"
              aria-label="Logout"
            />
          </div>
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
          <div style={{ padding: 24 }}>
            <Title level={4}>Teams</Title>
            <Button
              onClick={handleAdd}
              type="primary"
              style={{ marginBottom: 16 }}
            >
              Add New Team
            </Button>
            <div className="table-wrapper" style={{ width: "100%" }}>
              <Form form={form} component={false}>
                <Table
                  rowKey="id"
                  bordered
                  dataSource={dataSource}
                  columns={columns}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: "max-content" }}
                />
              </Form>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TeamManagementIndex;
