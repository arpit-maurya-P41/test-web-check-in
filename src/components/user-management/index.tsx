"use client";

import React, { useState, useEffect } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button, Layout, theme, Table, Input, Popconfirm, Form, Space, Typography, Select, message, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";

import { logoutUser } from "@/app/actions/authActions";

import { teams } from "@prisma/client";
import Sidebar from "../Sidebar";
import { convertTimeToUTC } from "@/utils/timeUtils";
import { useNotification } from "../NotificationProvider";
import { Spin } from "antd";
import { UserProps } from "@/type/PropTypes";
import { User } from "@/type/types";
import { useRouter } from "next/navigation";

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const UserManagementIndex: React.FC<UserProps> = ({ userId, isAdmin }) => {
    const [form] = Form.useForm();
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState<boolean>(true);
    const [teams, setTeams] = useState<teams[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [editingRow, setEditingRow] = useState<{id: number, method: string}>({id: 0, method: "add"});
    const notify = useNotification();
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [newUserId, setNewUserId] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try{
            const teamsAPIResponse = await fetch("/api/teams");
            const teamsData = await teamsAPIResponse.json();
            setTeams(teamsData.teams);

            const usersAPIResponse = await fetch("/api/users");
            const usersData = await usersAPIResponse.json();
            setUsers(usersData.users);
            setNewUserId(usersData.latestUserId);
            }
            catch(error){
                console.error("Error fetching data", error);
            }
            finally{
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchData = () => {
        fetch("/api/users")
            .then((response) => response.json())
            .then((data) => {
                setUsers(data.users);
                setNewUserId(data.latestUserId)
            });
    };


    const handleDelete = (id: number) => {
        const deleteUser = {
            id: id
        }
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
        if(users.length > 0){
            const index = 0;
            if(users[index]?.first_name === '')
            {
                notify("info", "Please save or cancel the current user entry before adding a new one.");
                return;
            }
        }

        const newRow: User = {
            id: newUserId,
            first_name: "",
            last_name: "",
            email: "",
            user_team_mappings: [],
            user_team_role: []
        };
        setUsers([newRow, ...users]);
        handleEdit(newRow, "add");
    };

    const handleEdit = (user: User, method: string) => {
        setEditingRow({id : user.id, method: method});
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
            : users.find(u => u.id === userId)?.email?.toLowerCase();

            if (isAdding &&
                users.find(
                    user => user.id !== userId &&
                        user.email?.toLowerCase() === emailToCheck
                )
            ) {
                notify("error", "The entry with the Email already exists");
                setIsSaving(false);
                return;
            }

            const updatedUser = {
                id: userId,
                first_name: isAdding ? values.first_name : users.find(u => u.id === userId)?.first_name || "",
                last_name: isAdding ? values.last_name : users.find(u => u.id === userId)?.last_name || "",
                email: emailToCheck,
                user_team_mappings: values.team_ids,
                check_in_time: convertTimeToUTC("9:00", "Asia/Kolkata"),
                check_out_time: convertTimeToUTC("18:00", "Asia/Kolkata"),
                is_active: true
            };

            fetch("/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedUser),
            })
                .then((response) => response.json())
                .then(() => {
                    resetAndFetch();
                });

            notify('success', 'Data saved successfully.');
        } catch {
            message.error("Validation failed");
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        resetAndFetch();
    };

    const resetAndFetch = () => {
        setEditingRow({id: 0, method: "add"});
        form.resetFields();
        fetchData();
        setIsSaving(false);
    }

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
                            <Input placeholder="First Name"/>
                        </Form.Item>
                    );
                }
                return (
                    <span
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/profile/${record.id}`)}
                    >
                        {record.first_name}
                    </span>
                )
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
                            rules={[
                                { required: false},
                            ]}
                            style={{ margin: 0 }}
                        >
                            <Input placeholder="Last Name"/>
                        </Form.Item>
                    );
                }
                return (
                    <span
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/profile/${record.id}`)}
                    >
                        {record.last_name}
                    </span>
                )
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
                            <Input placeholder="Email"/>
                        </Form.Item>
                    );
                }
                return (
                    <span
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/profile/${record.id}`)}
                    >
                        {record.email}
                    </span>
                )
            },
        },
        {
            title: "Teams",
            dataIndex: "user_team_mappings",
            render: (_: unknown, record: User) => {
                if (editingRow.id === record.id) {
                    return (
                        <Form.Item
                            name="team_ids"
                            style={{ margin: 0 }}
                        >
                            <Select
                                mode="multiple"
                                showSearch={false}
                                allowClear
                                style={{ width: "100%" }}
                                placeholder="Select Teams"
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
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/profile/${record.id}`)}
                    >
                        { record.user_team_mappings.map((t) => t.teams.name).join(", ")}
                    </span>
                )
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
                                loading={isSaving} disabled={isSaving} 
                            >
                                {isSaving ? "Saving..." : "Save"}
                            </Button>
                            <Button onClick={handleCancel} disabled={isSaving}>Cancel</Button>
                        </Space>
                    );
                }
                return (
                    <Space>
                        <Button disabled={editingRow.id !== 0} onClick={() => handleEdit(record, "edit")} type="link">
                            Edit
                        </Button>
                        <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record.id)}>
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
        loading ? (
                <Spin percent="auto" fullscreen size="large" />
        ) : 
        <Layout>
            <Sidebar
                collapsed={collapsed}
                activeKey="userManagement"
                userId={userId}
                isAdmin={isAdmin}
            />
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
                        overflowX: "auto"
                    }}
                >
                    <div style={{ padding: "16px", overflowX: "auto"}}>
                    <Title level={4}>Users</Title>
                    <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16, width: "100%", maxWidth: 200 }}>
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
                        />
                    </Form>
                </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default UserManagementIndex;