"use client";

import React, { useState, useEffect } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button, Layout, theme, Table, Input, Popconfirm, Form, Space, Typography, Select, message } from "antd";
import type { ColumnsType } from "antd/es/table";

import { logoutUser } from "@/app/actions/authActions";

import { roles, teams } from "@prisma/client";
import Sidebar from "../Sidebar";

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

type Props = {
    userId: string;
    roles: roles
}

type Role = {
    id: number;
    role_name: string;
}

type UserTeamMapping = {
    team_id: number;
    teams: teams;
};

type User = {
    id: number;
    name: string;
    email: string;
    slack_user_id: string;
    password: string;
    user_team_mappings: UserTeamMapping[];
    roles: Role;
};

const UserManagementIndex: React.FC<Props> = ({ roles }) => {
    const [form] = Form.useForm();
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [teams, setTeams] = useState<teams[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [rolesData, setRoles] = useState<Role[]>([]);
    const [editingRow, setEditingRow] = useState<number>(0);

    useEffect(() => {
        const fetchData = async () => {
            const teamsAPIResponse = await fetch("/api/teams");
            const teamsData = await teamsAPIResponse.json();
            setTeams(teamsData);

            const usersAPIResponse = await fetch("/api/users");
            const usersData = await usersAPIResponse.json();
            setUsers(usersData);

            const rolesAPIResponse = await fetch("/api/roles");
            const roledata = await rolesAPIResponse.json();
            setRoles(roledata);
        };
        fetchData();
    }, []);

    const fetchData = () => {
        fetch("/api/users")
            .then((response) => response.json())
            .then((data) => {
                setUsers(data);
            });
    };

    const deleteData = (id: number) => {
        fetch(`/api/users/${id}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((data) => {
                setUsers(data);
            });

    }


    // const save = async (id: number) => {
    //     try {
    //         const row = await form.validateFields();
    //         const newData = [...users];

    //         const index = newData.findIndex((item) => id === item.id);
    //         if (index > -1) {
    //             newData[index] = { ...newData[index], ...row };
    //             fetch("/api/users", {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //                 body: JSON.stringify(newData[index]),
    //             })
    //                 .then((response) => response.json())
    //                 .then((data) => {
    //                     setUsers(data);
    //                     setEditingKey(0);
    //                 });
    //         }
    //     } catch (errInfo) {
    //         console.log("Validate Failed:", errInfo);
    //     }
    // };

    const handleDelete = (id: number) => {
        deleteData(id);
    };

    const handleAdd = () => {
        const count = users.length > 0 ? users[users.length - 1].id + 1 : 1;
        const newRow: User = {
            id: count,
            name: "",
            email: "",
            slack_user_id: "",
            password: "",
            roles: {
                id: 0,
                role_name: "",
            },
            user_team_mappings: [],
        };
        setUsers([...users, newRow]);
        handleEdit(newRow);
    };

    const handleEdit = (user: User) => {
        setEditingRow(user.id);
        form.setFieldsValue({
            name: user.name,
            email: user.email,
            slack_user_id: user.slack_user_id,
            password: user.password,
            team_ids: user.user_team_mappings.map((t) => t.team_id),
            role_id: user.roles.id,
        });
    };

    const handleSave = async (userId: number) => {
        try {
            const values = await form.validateFields();

            console.log("values", values);

            console.log("teams ", values.team_ids);
            console.log("user email ", values.email);
            console.log("user name ", values.name);

            console.log("userId ", userId);

            const updatedUser = {
                id: userId,
                name: values.name,
                email: values.email,
                slack_user_id: values.slack_user_id,
                password: values.password,
                user_team_mappings: values.team_ids,
                role_id: values.role_id,
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

            message.success("User updated");
        } catch {
            message.error("Validation failed");
        }
    };

    const handleCancel = () => {
        resetAndFetch();
    };

    const resetAndFetch = () => {
        setEditingRow(0);
        form.resetFields();
        fetchData();
    }

    const columns: ColumnsType<User> = [
        {
            title: "Name",
            dataIndex: "name",
            render: (_: unknown, record: User) => {
                if (editingRow === record.id) {
                    return (
                        <Form.Item
                            name="name"
                            rules={[
                                { required: true, message: "Name is required" },
                                { min: 2, message: "Minimum 2 characters" },
                            ]}
                            style={{ margin: 0 }}
                        >
                            <Input />
                        </Form.Item>
                    );
                }
                return record.name;
            },
        },
        {
            title: "Email",
            dataIndex: "email",
            render: (_: unknown, record: User) => {
                if (editingRow === record.id) {
                    return (
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: "Email is required" },
                                { type: "email", message: "Invalid email" },
                            ]}
                            style={{ margin: 0 }}
                        >
                            <Input />
                        </Form.Item>
                    );
                }
                return record.email;
            },
        },
        {
            title: "Slack User Id",
            dataIndex: "slack_user_id",
            render: (_: unknown, record: User) => {
                if (editingRow === record.id) {
                    return (
                        <Form.Item
                            name="slack_user_id"
                            rules={[
                                { required: true, message: "Slack User Id is required" },
                            ]}
                            style={{ margin: 0 }}
                        >
                            <Input />
                        </Form.Item>
                    );
                }
                return record.slack_user_id;
            },
        },
        {
            title: "Password",
            dataIndex: "password",
            render: (_: unknown, record: User) => {
                if (editingRow === record.id) {
                    return (
                        <Form.Item
                            name="password"
                            rules={[
                                { required: true, message: "Password is required" },
                                { min: 6, message: "Minimum 6 characters" },
                                { max: 20, message: "Maximum 20 characters" },
                                { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/, message: "Password must contain at least one uppercase letter, one lowercase letter, and one number" },
                            ]}
                            style={{ margin: 0 }}
                        >
                            <Input />
                        </Form.Item>
                    );
                }
                return record.password;
            },
        },
        {
            title: "Role",
            dataIndex: "roles",
            render: (_: unknown, record: User) => {
                if (editingRow === record.id) {
                    return (
                        <Form.Item
                            name="role_id"
                            rules={[
                                { required: true, message: "Select at least one team" },
                            ]}
                            style={{ margin: 0 }}
                        >
                            <Select
                                showSearch={false}
                                allowClear
                                style={{ width: "100%" }}
                                placeholder="Select teams"
                            >
                                {rolesData.map((role) => (
                                    <Option key={role.id} value={role.id}>
                                        {role.role_name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    );
                }
                return record.roles.role_name;
            },
        },
        {
            title: "Teams",
            dataIndex: "user_team_mappings",
            render: (_: unknown, record: User) => {
                if (editingRow === record.id) {
                    return (
                        <Form.Item
                            name="team_ids"
                            rules={[
                                { required: true, message: "Select at least one team" },
                            ]}
                            style={{ margin: 0 }}
                        >
                            <Select
                                mode="multiple"
                                showSearch={false}
                                allowClear
                                style={{ width: "100%" }}
                                placeholder="Select teams"
                            >
                                {teams.map((team) => (
                                    <Option key={team.id} value={team.id}>
                                        {team.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    );
                }
                return record.user_team_mappings.map((t) => t.teams.name).join(", ");
            },
        },
        {
            title: "Action",
            render: (_: unknown, record: User) => {
                if (editingRow === record.id) {
                    return (
                        <Space>
                            <Button
                                type="primary"
                                onClick={() => handleSave(record.id)}
                            >
                                Save
                            </Button>
                            <Button onClick={handleCancel}>Cancel</Button>
                        </Space>
                    );
                }
                return (
                    <Space>
                        <Button onClick={() => handleEdit(record)} type="link">
                            Edit
                        </Button>
                        <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record.id)}>
                            <Button type="link" danger>
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
                collapsed={collapsed}
                canManageTeams={roles.can_manage_teams}
                canManageUsers={roles.can_manage_users}
                canViewReports={roles.can_view_reports}
                canManageRoles={roles.can_manage_roles}
                activeKey="userManagement"
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
                        <Title level={4}>Users</Title>
                        <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
                            Add new User
                        </Button>
                        <Form form={form} component={false}>
                            <Table
                                rowKey="id"
                                dataSource={users}
                                columns={columns}
                                pagination={false}
                            />
                        </Form>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default UserManagementIndex;