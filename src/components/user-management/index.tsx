"use client";

import React, { useState, useEffect } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button, Layout, theme, Table, Input, Popconfirm, Form, Space, Typography, Select, message, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";

import { logoutUser } from "@/app/actions/authActions";

import { teams } from "@prisma/client";
import Sidebar from "../Sidebar";
import { convertTimeToUTC, getTimeZones } from "@/utils/timeUtils";
import { useNotification } from "../NotificationProvider";
import { Spin } from "antd";
import { Props } from "@/type/PropTypes";
import { Role, User } from "@/type/types";

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const UserManagementIndex: React.FC<Props> = ({ roles }) => {
    const [form] = Form.useForm();
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    const [collapsed, setCollapsed] = useState<boolean>(true);
    const [teams, setTeams] = useState<teams[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [rolesData, setRoles] = useState<Role[]>([]);
    const [editingRow, setEditingRow] = useState<number>(0);
    const notify = useNotification();
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try{
            const teamsAPIResponse = await fetch("/api/teams");
            const teamsData = await teamsAPIResponse.json();
            setTeams(teamsData);

            const usersAPIResponse = await fetch("/api/users");
            const usersData = await usersAPIResponse.json();
            setUsers(usersData);

            const rolesAPIResponse = await fetch("/api/roles");
            const roledata = await rolesAPIResponse.json();
            setRoles(roledata);
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

    const handleDelete = (id: number) => {
        deleteData(id);
    };

    const handleAdd = () => {
        if(users.length > 0){
            const index = 0;
            if(users[index]?.slack_user_id === '' && users[index]?.first_name === '')
            {
                notify("info", "Please save or cancel the current user entry before adding a new one.");
                return;
            }
        }

        const count = users.length > 0 ? users[0].id + 1 : 1;
        const newRow: User = {
            id: count,
            first_name: "",
            last_name: "",
            email: "",
            slack_user_id: "",
            roles: {
                id: 0,
                role_name: "",
            },
            user_team_mappings: [],
            timezone: ""
        };
        setUsers([newRow, ...users]);
        handleEdit(newRow);
    };

    const handleEdit = (user: User) => {
        setEditingRow(user.id);
        form.setFieldsValue({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            slack_user_id: user.slack_user_id,
            team_ids: user.user_team_mappings.map((t) => t.team_id),
            role_id: user.roles.id != 0 ? user.roles.id : undefined,
            timezone: user.timezone || undefined
        });
    };

    const handleSave = async (userId: number) => {
        try {
            setIsSaving(true);
            const values = await form.validateFields();
            if(users.find(user => user.id !== userId && ((user.slack_user_id === values.slack_user_id)
            || (user.email === values.email))
            ))
            {
                notify('error', 'The entry with the Slack User Id or Email already Exists');
                setIsSaving(false);
                return;
            }

            const updatedUser = {
                id: userId,
                first_name: values.first_name,
                last_name: values.last_name,
                email: values.email,
                slack_user_id: values.slack_user_id,
                user_team_mappings: values.team_ids,
                role_id: values.role_id,
                timezone: values.timezone,
                check_in_time: convertTimeToUTC("9:00", values.timezone),
                check_out_time: convertTimeToUTC("18:00", values.timezone)
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
        setEditingRow(0);
        form.resetFields();
        fetchData();
        setIsSaving(false);
    }

    const columns: ColumnsType<User> = [
        {
            title: "First Name",
            dataIndex: "first_name",
            render: (_: unknown, record: User) => {
                if (editingRow === record.id) {
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
                return record.first_name;
            },
        },
        {
            title: "Last Name",
            dataIndex: "last_name",
            render: (_: unknown, record: User) => {
                if (editingRow === record.id) {
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
                return record.last_name;
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
                            <Input placeholder="Email"/>
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
                            <Input placeholder="Slack User Id"/>
                        </Form.Item>
                    );
                }
                return record.slack_user_id;
            },
        },
        {
            title: "Time Zone",
            dataIndex: "timezone",
            render: (_: unknown, record: User) => {
                if (editingRow === record.id) {
                    return (
                        <Form.Item
                            name="timezone"
                            rules={[{ required: true, message: 'Please select timezone!' }]}
                            style={{ margin: 0 }}
                        >
                            <Select showSearch placeholder="Select Timezone">
                                {getTimeZones().map(({ label, value }) => (
                                    <Select.Option key={value} value={value}>
                                        <Tooltip placement="topLeft" title={label}>
                                        {label}
                                        </Tooltip>
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    );
                }
                return record.timezone;
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
                                { required: true, message: "Select at least one role" },
                            ]}
                            style={{ margin: 0 }}
                        >
                            <Select
                                showSearch={false}
                                allowClear
                                style={{ width: "100%" }}
                                placeholder="Select Role"
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
                        <Button disabled={editingRow !== 0} onClick={() => handleEdit(record)} type="link">
                            Edit
                        </Button>
                        <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record.id)}>
                            <Button disabled={editingRow !== 0} type="link" danger>
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
                    <div style={{ padding: "16px", overflowX: "auto" }}>
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