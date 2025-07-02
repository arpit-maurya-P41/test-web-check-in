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
import { useFetch } from "@/utils/useFetch";
import { useNotification } from "../NotificationProvider";

const { Header, Content } = Layout;
const { Title } = Typography;

const TeamManagementIndex: React.FC<TeamProps> = ({ userId, isAdmin, isManager }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { sidebarCollapsed, toggleSidebar } = useSidebarStore();
  const notify = useNotification();

  const [dataSource, setDataSource] = useState<TeamWithUserCount[]>([]);
  const [newTeamId, setNewTeamId] = useState(1);

  const { data: teamsData } = useFetch<{ teams: TeamWithUserCount[], latestTeamId: number }>('/api/teams');

  useEffect(() => {
    if (teamsData) {
      setDataSource(teamsData.teams);
      setNewTeamId(teamsData.latestTeamId);
    }
  }, [teamsData]);

  const handleAdd = () => {
    sessionStorage.setItem("hideDelete", "true");
    router.push(`/team-management/${newTeamId}`);
  };

  const handleTeamClick = async (teamId: number) => {
    if (isAdmin) {
      router.push(`/team-management/${teamId}`);
      return;
    }
    // Check if user is manager for this team
    try {
      const res = await fetch(`/api/user-team-role?userId=${userId}&teamId=${teamId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.roles && data.roles.role_name && data.roles.role_name.toLowerCase() === "manager") {
          router.push(`/team-management/${teamId}`);
        } else {
          notify("error", "You do not have access to this team.");
        }
      } else {
        notify("error", "You do not have access to this team.");
      }
    } catch {
      notify("error", "Unable to check access. Please try again.");
    }
  };

  const columns: ColumnsType<TeamWithUserCount> = [
    {
      title: "Name",
      dataIndex: "name",
      render: (_: unknown, record: TeamWithUserCount) => {
        return (
          <span
            style={{ cursor: "pointer" }}
            onClick={() => handleTeamClick(record.id)}
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
        isManager={isManager}
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
            {isAdmin && <Button
              onClick={handleAdd}
              type="primary"
              style={{ marginBottom: 16 }}
            >
              Add New Team
            </Button>}
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
