"use client";

import React, { useState, useEffect } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button, Layout, theme, Table, Input, Popconfirm, Form, Space, Typography, Checkbox } from "antd";
import { roles } from "@prisma/client";
import Sidebar from "../Sidebar";
import { ColumnsType } from "antd/es/table";
import { logoutUser } from "@/app/actions/authActions";

const { Header, Content } = Layout;
const { Title } = Typography;

type Props = {
    userId: string;
    roles: roles
}

const RoleManagementIndex: React.FC<Props> = ({ roles }) => {
    const [form] = Form.useForm();
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [dataSource, setDataSource] = useState<roles[]>([]);
    const [editingKey, setEditingKey] = useState<number>(0);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("/api/roles");
            const data = await response.json();
            setDataSource(data);
        };
        fetchData();
    }, []);

    const fetchData = () => {
        fetch("/api/roles")
            .then((response) => response.json())
            .then((data) => {
                setDataSource(data);
            });
    };

    const deleteData = (id: number) => {
        fetch(`/api/roles/${id}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((data) => {
                setDataSource(data);
            });

    }

    const isEditing = (record: roles) => record.id === editingKey;

    const edit = (record: roles) => {
        console.log(record)
        form.setFieldsValue({ ...record });
        setEditingKey(record.id);
    };

    const cancel = () => {
        fetchData();
        setEditingKey(0);
    };

    const save = async (id: number) => {
        try {
            const row = await form.validateFields();
            const newData = [...dataSource];

            const index = newData.findIndex((item) => id === item.id);
            if (index > -1) {
                newData[index] = { ...newData[index], ...row };
                console.log(newData[index]);
                fetch("/api/roles", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newData[index]),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        setDataSource(data);
                        setEditingKey(0);
                    });
            }
        } catch (errInfo) {
            console.log("Validate Failed:", errInfo);
        }
    };

    const handleDelete = (id: number) => deleteData(id);

    const handleAdd = () => {
        const count = dataSource.length > 0 ? dataSource[dataSource.length - 1].id + 1 : 1;
        const newRow: roles = {
            id: count,
            role_name: "",
            can_manage_roles: false,
            can_manage_teams: false,
            can_manage_users: false,
            can_view_reports: false
        };
        setDataSource([...dataSource, newRow]);
        edit(newRow);
    };

    const columns: ColumnsType<roles> = [
        {
            title: "Name",
            dataIndex: "role_name",
            render: (_: unknown, record: roles) =>
                isEditing(record) ? (
                    <Form.Item
                        name="role_name"
                        style={{ margin: 0 }}
                        rules={[{ required: true, message: "Please input a name!" }]}
                    >
                        <Input />
                    </Form.Item>
                ) : (
                    record.role_name
                ),
        },
        ...["can_view_reports", "can_manage_teams", "can_manage_users", "can_manage_roles"].map((perm) => ({
            title: perm.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            dataIndex: perm,
            render: (_: unknown, record: roles) => {
                return isEditing(record) ? (
                    <Form.Item name={perm} valuePropName="checked" style={{ margin: 0 }}>
                        <Checkbox />
                    </Form.Item>
                ) : (
                    <Checkbox checked={record[perm as keyof roles] as boolean} disabled />
                );
            },
        })),
        {
            title: "Actions",
            dataIndex: "actions",
            render: (_: unknown, record: roles) => {
                const editable = isEditing(record);
                return editable ? (
                    <Space>
                        <Button onClick={() => save(record.id)} type="link">
                            Save
                        </Button>
                        <Button onClick={cancel} type="link">
                            Cancel
                        </Button>
                    </Space>
                ) : (
                    <Space>
                        <Button disabled={editingKey !== 0} onClick={() => edit(record)} type="link">
                            Edit
                        </Button>
                        <Popconfirm title="Are you sure?" onConfirm={() => handleDelete(record.id)}>
                            <Button disabled={editingKey !== 0} type="link" danger>
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
                activeKey="roleManagement"
                fullHeight={true}
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
                        <Title level={4}>Roles</Title>
                        <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
                            Add new role
                        </Button>
                        <Form form={form} component={false}>
                            <Table
                                bordered
                                dataSource={dataSource}
                                columns={columns}
                                rowClassName="editable-row"
                                pagination={{ pageSize: 5 }}
                                components={{
                                    body: {
                                        cell: ({ children, ...restProps }) => <td {...restProps}>{children}</td>,
                                    },
                                }}
                            />
                        </Form>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default RoleManagementIndex;