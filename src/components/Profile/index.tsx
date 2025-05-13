'use client'
import { Button, Col, Form, Input, Layout, Row, Select, theme, TimePicker, Typography } from "antd";
import { roles } from "@prisma/client";
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { logoutUser } from "@/app/actions/authActions";
import Sidebar from "../Sidebar";
import moment from 'moment-timezone';

const { Header, Content } = Layout;
const { Title } = Typography;

type Props = {
    userId: string;
    roles: roles
}

type FormValues = {
    FirstName: string;
    LastName: string;
    Title: string;
    Location: string;
    timezone: string;
    checkIn: moment.Moment | null;
    checkOut: moment.Moment | null;
    About: string;
};

const Profile: React.FC<Props> = ({ roles, userId }) => {
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const [form] = Form.useForm();

    const timezones = moment.tz.names().map(tz => {
        const offset = moment.tz(tz).format('Z');
        return {
          label: `${tz} (GMT ${offset})`,
          value: tz,
        };
    });

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;
            const response = await fetch(`/api/users/${userId}`);
            const user = await response.json();

            form.setFieldsValue({
                Title: user.title,
                FirstName: user.first_name,
                LastName: user.last_name,
                Location: user.location,
                timezone: user.timezone,
                checkIn: user.check_in_time ? moment(user.check_in_time) : null,
                checkOut: user.check_out_time ? moment(user.check_out_time) : null,
                About: user.about_you,
            });
        };
        fetchUser();
    }, [userId]);

    const handleSave = async (values: FormValues) => {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    first_name: values.FirstName,
                    last_name: values.LastName,
                    title: values.Title,
                    location: values.Location,
                    timezone: values.timezone,
                    check_in_time: values.checkIn,
                    check_out_time: values.checkOut,
                    about_you: values.About,
                }),
            });
    
            const data = await response.json();
            if (!response.ok) {
                console.error("Failed to update user:", data.error);
                return;
            }
            form.resetFields();
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };
    
    const handleCancel = () => {
        form.resetFields();
    };

    return (
        <Layout>
            <Sidebar
                collapsed={collapsed}
                canManageTeams={roles.can_manage_teams}
                canManageUsers={roles.can_manage_users}
                canViewReports={roles.can_view_reports}
                canManageRoles={roles.can_manage_roles}
                activeKey="profile"
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
                    <Title level={4}>Profile</Title>
                    <Form layout="vertical" form={form} onFinish={handleSave}>
                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item
                                    label="Title"
                                    name="Title"
                                    rules={[{ required: true }]}
                                >
                                    <Select placeholder="Select your title">
                                        <Select.Option value="Mr">Mr.</Select.Option>
                                        <Select.Option value="Ms">Ms.</Select.Option>
                                        <Select.Option value="Mrs">Mrs.</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item
                                    label="First Name"
                                    name="FirstName"
                                    rules={[{ required: true, message: 'Please input!' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item
                                    label="Last Name"
                                    name="LastName"
                                    rules={[{ required: true, message: 'Please input!' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item
                                    label="Location"
                                    name="Location"
                                    rules={[{ required: true, message: 'Please input!' }]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item
                                    label="Timezone"
                                    name="timezone"
                                    rules={[{ required: true, message: 'Please select your timezone!' }]}
                                >
                                    <Select showSearch placeholder="Select timezone">
                                        {timezones.map(({ label, value }) => (
                                            <Select.Option key={value} value={value}>
                                                {label}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item
                                    label="Check-in Time"
                                    name="checkIn"
                                    rules={[{ required: true, message: 'Please select check-in time!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const checkOut = getFieldValue('checkOut');
                                            if (!value || !checkOut) {
                                                return Promise.resolve();
                                            }
                                            if (value.isBefore(checkOut)) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Check-in time must be before check-out time!'));
                                        },
                                    }),
                                    ]}
                                >
                                    <TimePicker format="HH:mm" minuteStep={15} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item
                                    label="Check-out Time"
                                    name="checkOut"
                                    rules={[{ required: true, message: 'Please select check-out time!' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                const checkIn = getFieldValue('checkIn');
                                                if (!value || !checkIn) {
                                                    return Promise.resolve();
                                                }
                                                if (value.isAfter(checkIn)) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Check-out time must be after check-in time!'));
                                            },
                                        })
                                    ]}
                                >
                                    <TimePicker format="HH:mm" minuteStep={15} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    label="About you"
                                    name="About"
                                    rules={[{ required: true, message: 'Please input!' }]}
                                >
                                    <Input.TextArea rows={4} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row justify="center" gutter={16}>
                            <Col>
                                <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                                    Save
                                </Button>
                                <Button htmlType="button" onClick={() => handleCancel()}>
                                    Cancel
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Content>
            </Layout>
        </Layout>
    );
}

export default Profile;