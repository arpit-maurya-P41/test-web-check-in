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
  Input,
  Popconfirm,
  Form,
  Space,
  Typography,
  Select,
  message,
  Tooltip,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { logoutUser } from "@/app/actions/authActions";
import Sidebar from "../Sidebar";
import { useSidebarStore } from "@/store/sidebarStore";
import { convertTimeToUTC } from "@/utils/timeUtils";
import { useNotification } from "../NotificationProvider";
import { UserProps, Team } from "@/type/PropTypes";
import { User, EditingRow } from "@/type/types";
import { useRouter } from "next/navigation";
import { useFetch } from "@/utils/useFetch";

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const UserManagementIndex: React.FC<UserProps> = ({ userId, isAdmin }) => {
  const [form] = Form.useForm();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebar } = useSidebarStore();
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [editingRow, setEditingRow] = useState<EditingRow>({
    id: 0,
    method: "add",
  });
  const notify = useNotification();
  const [isSaving, setIsSaving] = useState(false);
  const [newUserId, setNewUserId] = useState(1);

  const { data: teamsData } = useFetch<{ teams: Team[] }>('/api/teams');

  const { data: usersData, refetch: refetchUsers } = useFetch<{ users: User[], latestUserId: number }>('/api/users');

  useEffect(() => {
    if (teamsData) {
      setTeams(teamsData.teams);
    }
  }, [teamsData]);

  useEffect(() => {
    if (usersData) {
      setUsers(usersData.users);
      setNewUserId(usersData.latestUserId);
    }
  }, [usersData]);

  const handleDelete = (id: number) => {
    if (id === Number(userId)) {
      notify("error", "You cannot delete your own account.");
      return;
    }
    const deleteUser = {
      id: id,
    };
    fetch(`/api/users/${id}/deactivate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deleteUser),
    })
      .then((response) => response.json())
      .then(() => {
        resetAndFetch();
      });
  };

  const handleAdd = () => {
    if (users.length > 0) {
      const index = 0;
      if (users[index]?.first_name === "") {
        notify(
          "info",
          "Please save or cancel the current user entry before adding a new one."
        );
        return;
      }
    }

    const newRow: User = {
      id: newUserId,
      first_name: "",
      last_name: "",
      email: "",
      user_team_mappings: [],
      user_team_role: [],
    };
    setUsers([newRow, ...users]);
    handleEdit(newRow, "add");
  };

  const handleEdit = (user: User, method: string) => {
    setEditingRow({ id: user.id, method: method });
    form.setFieldsValue({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      team_ids: user.user_team_mappings.map((t) => t.team_id),
    });
  };

  const handleSave = async (userId: number) => {
    try {
      setIsSaving(true);
      const values = await form.validateFields();

      const isAdding = editingRow.method === "add";

      const emailToCheck = isAdding
        ? values.email?.toLowerCase()
        : users.find((u) => u.id === userId)?.email?.toLowerCase();

      if (
        isAdding &&
        users.find(
          (user) =>
            user.id !== userId && user.email?.toLowerCase() === emailToCheck
        )
      ) {
        notify("error", "The entry with the Email already exists");
        setIsSaving(false);
        return;
      }

      const updatedUser = {
        id: userId,
        first_name: isAdding
          ? values.first_name
          : users.find((u) => u.id === userId)?.first_name || "",
        last_name: isAdding
          ? values.last_name
          : users.find((u) => u.id === userId)?.last_name || "",
        email: emailToCheck,
        user_team_mappings: values.team_ids,
        check_in_time: convertTimeToUTC("9:00", "Asia/Kolkata"),
        check_out_time: convertTimeToUTC("18:00", "Asia/Kolkata"),
        is_active: true,
      };

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        notify("error", result.error || "Failed to save user data.");
      } else {
        resetAndFetch();
        notify("success", "Data saved successfully.");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      message.error("Validation failed");
    }
  };

  const handleCancel = () => {
    resetAndFetch();
  };

  const resetAndFetch = () => {
    setEditingRow({ id: 0, method: "add" });
    form.resetFields();
    refetchUsers();
    setIsSaving(false);
  };

  const columns: ColumnsType<User> = [
    {
      title: "First Name",
      dataIndex: "first_name",
      render: (_: unknown, record: User) => {
        if (editingRow.id === record.id && editingRow.method === "add") {
          return (
            <Form.Item
              name="first_name"
              rules={[
                { required: true, message: "Name is required" },
                { min: 2, message: "Minimum 2 characters" },
              ]}
              style={{ margin: 0 }}
            >
              <Input placeholder="First Name" />
            </Form.Item>
          );
        }
        return (
          <span
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`/profile/${record.id}`)}
          >
            {record.first_name}
          </span>
        );
      },
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      render: (_: unknown, record: User) => {
        if (editingRow.id === record.id && editingRow.method === "add") {
          return (
            <Form.Item
              name="last_name"
              rules={[{ required: false }]}
              style={{ margin: 0 }}
            >
              <Input placeholder="Last Name" />
            </Form.Item>
          );
        }
        return (
          <span
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`/profile/${record.id}`)}
          >
            {record.last_name}
          </span>
        );
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (_: unknown, record: User) => {
        if (editingRow.id === record.id && editingRow.method === "add") {
          return (
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Invalid email" },
              ]}
              style={{ margin: 0 }}
            >
              <Input placeholder="Email" />
            </Form.Item>
          );
        }
        return (
          <span
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`/profile/${record.id}`)}
          >
            {record.email}
          </span>
        );
      },
    },
    {
      title: "Teams",
      dataIndex: "user_team_mappings",
      width: 500,
      render: (_: unknown, record: User) => {
        if (editingRow.id === record.id) {
          return (
            <Form.Item name="team_ids" style={{ margin: 0 }}>
              <Select
                mode="multiple"
                showSearch={false}
                allowClear
                placeholder="Select Teams"
                style={{ width: "100%", maxWidth: 500 }}
              >
                {teams.map((team) => (
                  <Option key={team.id} value={team.id}>
                    <Tooltip placement="topLeft" title={team.name}>
                      {team.name}
                    </Tooltip>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          );
        }
        return (
          <span
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`/profile/${record.id}`)}
          >
            {record.user_team_mappings.map((t) => t.teams.name).join(", ")}
          </span>
        );
      },
    },
    {
      title: "Actions",
      render: (_: unknown, record: User) => {
        if (editingRow.id === record.id) {
          return (
            <Space>
              <Button
                type="primary"
                onClick={() => handleSave(record.id)}
                loading={isSaving}
                disabled={isSaving}
                style={{ width: 80 }}
              >
                {isSaving ? "Saving.." : "Save"}
              </Button>
              <Button onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
            </Space>
          );
        }
        return (
          <Space>
            <Button
              disabled={editingRow.id !== 0}
              onClick={() => handleEdit(record, "edit")}
              type="link"
              style={{ width: 80 }}
            >
              Edit
            </Button>
            <Popconfirm
              title="Are you sure?"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button disabled={editingRow.id !== 0} type="link" danger>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <Layout>
      <Sidebar
        activeKey="userManagement"
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
            padding: 16,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            overflowX: "auto",
          }}
        >
          <div style={{ padding: "16px", overflowX: "auto" }}>
            <Title level={4}>Users</Title>
            <Button
              onClick={handleAdd}
              type="primary"
              style={{ marginBottom: 16, width: "100%", maxWidth: 200 }}
            >
              Add New User
            </Button>
            <Form form={form} component={false}>
              <Table
                rowKey="id"
                dataSource={users}
                columns={columns}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1000 }}
                size="small"
                style={{ tableLayout: "fixed" }}
              />
            </Form>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default UserManagementIndex;
