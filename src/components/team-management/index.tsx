"use client";

import React, { useState, useEffect } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button, Layout, theme, Table, Input, Popconfirm, Form, Space, Typography, Spin } from "antd";
import { teams } from "@prisma/client";
import Sidebar from "../Sidebar";
import { logoutUser } from "@/app/actions/authActions";
import './teams.css'
import { useNotification } from "../NotificationProvider";
import { ColumnsType } from "antd/es/table";
import { Props, Team } from "@/type/PropTypes";

const { Header, Content } = Layout;
const { Title } = Typography;

const TeamManagementIndex: React.FC<Props> = ({ userId, roles }) => {
    const [form] = Form.useForm();
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    const [collapsed, setCollapsed] = useState<boolean>(true);
    const [dataSource, setDataSource] = useState<teams[]>([]);
    const [editingKey, setEditingKey] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const notify = useNotification();

    useEffect(() => {
        const fetchData = async () => {
            try{
            const response = await fetch("/api/teams");
            const data = await response.json();
            setDataSource(data);
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
        fetch("/api/teams")
            .then((response) => response.json())
            .then((data) => {
                setDataSource(data);
            });
    };

    const deleteData = (id: number) => {
        const deleteTeam = {
            id: id
        }
        fetch(`/api/teams/${id}/deactivate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(deleteTeam)
        })
            .then((response) => response.json())
            .then(() => {
                cancel();
            });

    }

    const isEditing = (record: Team) => record.id === editingKey;

    const edit = (record: teams) => {
        form.setFieldsValue({ ...record });
        setEditingKey(record.id);
    };

    const cancel = () => {
        setEditingKey(0);
        form.resetFields();
        fetchData();
    };

    const save = async (id: number) => {
        try {
            const row = await form.validateFields();
            if(dataSource.find(team => team.id !== id && (team.slack_channel_id.toLowerCase() === row.slack_channel_id.toLowerCase() || 
                team.name.toLowerCase() === row.name.toLowerCase())))
            {
                notify('error', 'The Slack Channel ID or Team Name already exists.');
                return;
            }
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
                    .then(() => {
                        setEditingKey(0);
                        form.resetFields();
                        fetchData();
                        notify('success', 'Data saved successfully.');
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
        if(dataSource.length > 0){
            const index = 0;
            if(dataSource[index]?.name === '' && dataSource[index]?.slack_channel_id === '')
            {
                notify("info", "Please save or cancel the current team entry before adding a new one.");
                return;
            }
        }

        const newId = dataSource.length > 0 ? dataSource[0].id + 1 : 1;
        const newRow: teams = {
            id: newId,
            name: "",
            slack_channel_id: "",
            is_active: true
        };
        setDataSource([newRow, ...dataSource]);
        edit(newRow);
    };

    const columns: ColumnsType<Team> = [
        {
            title: "Name",
            dataIndex: "name",
            render: (_: unknown, record: Team) => {
                return isEditing(record) ? (
                    <Form.Item
                        name="name"
                        style={{ margin: 0 }}
                        rules={[{ required: true, message: "Please input a name!" }]}
                    >
                        <Input />
                    </Form.Item>
                ) : (
                    record.name
                )},
        },
        {
            title: "Slack Channel Id",
            dataIndex: "slack_channel_id",
            render: (_: unknown, record: Team) => {
                return isEditing(record) ? (
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
                )},
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
                activeKey="teamManagement"
                userId={userId}
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
                        scroll={{ x: 'max-content' }}
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