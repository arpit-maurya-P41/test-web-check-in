"use client";

import React, { useState, useEffect } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button, Layout, theme, Table, Input, Popconfirm, Form, Space, Typography } from "antd";
import { roles, teams } from "@prisma/client";
import Sidebar from "../Sidebar";
import { logoutUser } from "@/app/actions/authActions";
import './teams.css'

const { Header, Content } = Layout;
const { Title } = Typography;

type Props = {
    userId: string;
    roles: roles
}

const TeamManagementIndex: React.FC<Props> = ({ roles }) => {
    const [form] = Form.useForm();
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [dataSource, setDataSource] = useState<teams[]>([]);
    const [editingKey, setEditingKey] = useState<number>(0);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("/api/teams");
            const data = await response.json();
            setDataSource(data);
        };
        fetchData();
    }, []);

    const fetchData = () => {
        fetch("/api/teams")
            .then((response) => response.json())
            .then((data) => {
                setDataSource(data);
            });
    };

    const deleteData = (id: number) => {
        fetch(`/api/teams/${id}`, {
            method: "DELETE",
        })
            .then((response) => response.json())
            .then((data) => {
                setDataSource(data);
            });

    }

    const isEditing = (record: teams) => record.id === editingKey;

    const edit = (record: teams) => {
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
                fetch("/api/teams", {
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

    const handleDelete = (id: number) => {
        deleteData(id);
    };

    const handleAdd = () => {
        const count = dataSource.length > 0 ? dataSource[dataSource.length - 1].id + 1 : 1;
        const newRow: teams = {
            id: count,
            name: "",
            slack_channel_id: "",
        };
        setDataSource([...dataSource, newRow]);
        edit(newRow);
    };

    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            editable: true,
            render: (_: unknown, record: teams) =>
                isEditing(record) ? (
                    <Form.Item
                        name="name"
                        style={{ margin: 0 }}
                        rules={[{ required: true, message: "Please input a name!" }]}
                    >
                        <Input />
                    </Form.Item>
                ) : (
                    record.name
                ),
        },
        {
            title: "Slack Channel Id",
            dataIndex: "slack_channel_id",
            editable: true,
            render: (_: unknown, record: teams) =>
                isEditing(record) ? (
                    <Form.Item
                        name="slack_channel_id"
                        style={{ margin: 0 }}
                        rules={[
                            { required: true, message: "Please input an slack channel id!" }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                ) : (
                    record.slack_channel_id
                ),
        },
        {
            title: "Actions",
            dataIndex: "actions",
            render: (_: unknown, record: teams) => {
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

    const mergedColumns = columns.map((col) => {
        if (!col.editable) return col;
        return {
            ...col,
            onCell: (record: teams) => ({
                record,
                inputType: "text",
                dataIndex: col.dataIndex,
                title: col.title,
                editing: isEditing(record),
            }),
        };
    });

    return (
        <Layout>
            <Sidebar
                collapsed={collapsed}
                canManageTeams={roles.can_manage_teams}
                canManageUsers={roles.can_manage_users}
                canViewReports={roles.can_view_reports}
                canManageRoles={roles.can_manage_roles}
                activeKey="teamManagement"
            />
            <Layout>
            <Header style={{ padding: 0, background: colorBgContainer }}>
                <div className="header-container">
                    <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
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
                        <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
                            Add new Team
                        </Button>
                    <div className="table-wrapper" style={{ width: "100%" }}>
                    <Form form={form} component={false}>
                        <Table
                        rowKey="id"
                        bordered
                        dataSource={dataSource}
                        columns={mergedColumns}
                        rowClassName="editable-row"
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 'max-content' }}
                        components={{
                            body: {
                            cell: (props) => {
                                const { ...restProps } = props;
                                return <td {...restProps}>{props.children}</td>;
                            },
                            },
                        }}
                        />
                    </Form>
                    </div>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default TeamManagementIndex;