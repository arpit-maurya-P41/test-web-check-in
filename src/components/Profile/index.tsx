"use client";
import {
  Button,
  Col,
  Form,
  Input,
  Layout,
  Row,
  Select,
  Switch,
  theme,
  TimePicker,
  Tooltip,
  Typography,
} from "antd";
import {
  InfoCircleOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { logoutUser } from "@/app/actions/authActions";
import Sidebar from "../Sidebar";
import { useSidebarStore } from "@/store/sidebarStore";
import {
  convertTimeToUTC,
  getTimeZones,
  convertUtcTimeToLocal,
} from "@/utils/timeUtils";
import { useNotification } from "../NotificationProvider";
import { ProfileProps } from "@/type/PropTypes";
import { FormValues } from "@/type/types";

const { Header, Content } = Layout;
const { Title } = Typography;

const Profile: React.FC<ProfileProps> = ({ userId, isAdmin }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { sidebarCollapsed, toggleSidebar } = useSidebarStore();
  const [form] = Form.useForm();
  const format = "HH:mm";
  const notify = useNotification();

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      const response = await fetch(`/api/users/${userId}`);
      if (response.status === 404) {
        console.error("User not found");
        notify("error", "User not found.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const user = await response.json();

      form.setFieldsValue({
        Title: user.title,
        FirstName: user.first_name,
        LastName: user.last_name,
        Location: user.location,
        timezone: user.timezone,
        checkIn: convertUtcTimeToLocal(user.check_in_time, user.timezone),
        checkOut: convertUtcTimeToLocal(user.check_out_time, user.timezone),
        About: user.about_you,
        IsAdmin: user.is_admin,
      });
    };
    fetchUser();
  }, [userId, form]);

  const handleSave = async (values: FormValues) => {
    try {
      const { checkIn, checkOut, timezone } = values;
      if (!checkIn || !checkOut || !timezone) {
        throw new Error("Check-in, check-out, or timezone is missing.");
      }
      const checkInTime = convertTimeToUTC(
        checkIn.format("HH:mm:ss"),
        timezone
      );
      const checkOutTime = convertTimeToUTC(
        checkOut.format("HH:mm:ss"),
        timezone
      );

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
          check_in_time: checkInTime,
          check_out_time: checkOutTime,
          about_you: values.About,
          is_admin: values.IsAdmin,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("Failed to update user:", data.error);
        notify("error", "Error while saving data.");
        return;
      }
      notify("success", "Data saved successfully.");
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
        activeKey="profile"
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
                  rules={[{ required: true, message: "Please input!" }]}
                >
                  <Input placeholder="First Name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item label="Last Name" name="LastName">
                  <Input placeholder="Last Name" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Location"
                  name="Location"
                  rules={[{ required: true, message: "Please input!" }]}
                >
                  <Input placeholder="Location" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Timezone"
                  name="timezone"
                  rules={[
                    { required: true, message: "Please select your timezone!" },
                  ]}
                >
                  <Select showSearch placeholder="Select timezone">
                    {getTimeZones().map(({ label, value }) => (
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
                  rules={[
                    { required: true, message: "Please select check-in time!" },
                  ]}
                >
                  <TimePicker format={format} minuteStep={15} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Check-out Time"
                  name="checkOut"
                  rules={[
                    {
                      required: true,
                      message: "Please select check-out time!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const checkIn = getFieldValue("checkIn");
                        if (!checkIn || !value) {
                          return Promise.resolve();
                        }

                        const normalizedCheckIn = checkIn
                          .set("year", 1970)
                          .set("month", 0)
                          .set("date", 1);
                        const normalizedCheckOut = value
                          .set("year", 1970)
                          .set("month", 0)
                          .set("date", 1);

                        if (normalizedCheckOut.isAfter(normalizedCheckIn)) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error(
                            "Check-out time must be after check-in time"
                          )
                        );
                      },
                    }),
                  ]}
                >
                  <TimePicker format={format} minuteStep={15} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="About You" name="About">
                  <Input.TextArea rows={4} />
                </Form.Item>
              </Col>
            </Row>
            {isAdmin && (
              <Row gutter={16}>
                <Col>
                  <Form.Item
                    label={
                      <span>
                        Account Administrator&nbsp;
                        <Tooltip title="Account administrators can manage users, teams">
                          <InfoCircleOutlined style={{ color: "#999" }} />
                        </Tooltip>
                      </span>
                    }
                    name="IsAdmin"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            )}

            <Row justify="center" gutter={16}>
              <Col>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ marginRight: 8 }}
                >
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
};

export default Profile;
