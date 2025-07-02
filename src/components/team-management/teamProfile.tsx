"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  Layout,
  List,
  Row,
  Select,
  Skeleton,
  Space,
  theme,
  Typography,
} from "antd";
import { logoutUser } from "@/app/actions/authActions";
import { teamProfileProps } from "@/type/PropTypes";
import Sidebar from "../Sidebar";
import { useSidebarStore } from "@/store/sidebarStore";
import { TeamDetailsForm, TeamRole, User, TeamDetails } from "@/type/types";
import InfiniteScroll from "react-infinite-scroll-component";
import { useRouter } from "next/navigation";
import { useNotification } from "../NotificationProvider";
import { useFetch } from "@/utils/useFetch";

const { Header, Content } = Layout;
const { Title } = Typography;
const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

const TeamProfile: React.FC<teamProfileProps> = ({ userId, teamId, isAdmin, isManager }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { sidebarCollapsed, toggleSidebar } = useSidebarStore();
  const notify = useNotification();

  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState<TeamRole[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hideDelete, setHideDelete] = useState(false);

  const { data: teamData } = useFetch<TeamDetails>(
    `/api/teams/${teamId}/teamDetails`
  );

  const { data: rolesData } = useFetch<TeamRole[]>('/api/roles');

  useEffect(() => {
    if (teamData) {
      form.setFieldsValue({
        TeamName: teamData.name,
        TeamInfo: teamData.teaminfo ?? "",
        ChannelId: teamData.slack_channel_id,
      });
    }
  }, [teamData, form]);

  useEffect(() => {
    if (rolesData) {
      setUserRoles(rolesData);
    }
  }, [rolesData]);

  const deleteTeam = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}/deactivate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: teamId }),
      });

      const data = await response.json();
      if (!response.ok) {
        notify("error", data.error || "Error while deleting team.");
        return;
      }
      notify("success", "Team deleted successfully.");
      router.push(`/team-management`);
    } catch (error) {
      console.error("Error while deleting:", error);
      notify("error", "Unexpected error occurred.");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const loadMoreData = () => {
    if (loading) {
      return;
    }
    setLoading(true);
    fetch(`/api/teams/${teamId}/teamUsers?page=${page}&limit=10`)
      .then((res) => res.json())
      .then((body) => {
        const results = Array.isArray(body.data) ? body.data : [];
        const newUsers = [...data, ...results];
        setData(newUsers);
        setHasMore(body.meta && newUsers.length < body.meta.total);
        setPage((prevPage) => prevPage + 1);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const initialLoad = useRef(false);

  useEffect(() => {
      const hideDeleteButton = sessionStorage.getItem("hideDelete");
      if (hideDeleteButton === "true") {
        setHideDelete(true);
        sessionStorage.removeItem("hideDelete");
      }
    if (!initialLoad.current) {
      loadMoreData();
      initialLoad.current = true;
    }
  },[]);

  const roleMenuItems = userRoles.map((role) => ({
    value: role.id.toString(),
    label: role.role_name,
  }));

  const handleChange = async (roleId: string, userId: number) => {
    try {
      const response = await fetch("/api/user-team-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          team_id: parseInt(teamId, 10),
          role_id: parseInt(roleId, 10),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        notify("error", data.error || "Failed to update role.");
      } else {
        notify("success", "Role updated successfully.");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      notify("error", "Unexpected error occurred.");
    }
  };

  const handleSave = async (values: TeamDetailsForm) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/teamDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: teamId,
          name: values.TeamName,
          teaminfo: values.TeamInfo,
          slack_channel_id: values.ChannelId,
          is_active: true,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          notify(
            "error",
            data.error || "Team name or Slack Channel ID already exists."
          );
        } else {
          notify("error", data.error || "Error while saving data.");
        }
        return;
      }
      notify("success", "Data saved successfully.");
      router.push(`/team-management`);
    } catch (error) {
      console.error("Error while saving:", error);
      notify("error", "Unexpected error occurred.");
    }
  };

  return (
    <Layout>
      <Sidebar
        userId={userId}
        isAdmin={isAdmin}
        isManager={isManager}
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
           <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} style={{ margin: 0 }}>
                Team Info
              </Title>
            </Col>
            {isAdmin && !hideDelete && <Col>
              <Button danger onClick={deleteTeam}>
                Delete
              </Button>
            </Col>}
          </Row>
          <Form
            {...layout}
            name="nest-messages"
            labelAlign="left"
            form={form}
            onFinish={handleSave}
            style={{ maxWidth: 600 }}
          >
            <Form.Item
              label="Team Name"
              name="TeamName"
              rules={[
                { required: true, message: "Please input team name!" },
              ]}
            >
              <Input placeholder="Team name"/>
            </Form.Item>

            <Form.Item
              label="Slack Channel ID"
              name="ChannelId"
              rules={[
                { required: true, message: "Please input channel ID!" },
              ]}
            >
            <Input placeholder="Slack Channel Id"/>
            </Form.Item>
            <Form.Item name="TeamInfo" label="About this team">
              <Input.TextArea placeholder="What should people know about this team?" />
            </Form.Item>

            <Form.Item wrapperCol={{ span: 24 }}>
              <Title level={4}>Members</Title>
              <div
                id="scrollableDiv"
                style={{
                  height: 400,
                  overflow: "auto",
                  padding: "0 16px",
                  border: "1px solid rgba(140, 140, 140, 0.35)",
                }}
              >
                <InfiniteScroll
                  dataLength={data.length}
                  next={loadMoreData}
                  hasMore={hasMore}
                  loader={<Skeleton avatar paragraph={{ rows: 1 }} active />}
                  scrollableTarget="scrollableDiv"
                >
                  <List
                    dataSource={data}
                    renderItem={(user) => (
                      <List.Item key={user.email}>
                        <List.Item.Meta
                          title={`${user.first_name} ${user.last_name ?? ""}`}
                          description={user.email}
                        />
                        <Space wrap>
                            <Select
                              style={{ width: 120 }}
                              onChange={(value) => handleChange(value, user.id)}
                              options={roleMenuItems}
                              defaultValue={
                                user.user_team_role?.[0]?.role_id.toString() ??
                                "5"
                              }
                            />
                        </Space>
                      </List.Item>
                    )}
                  />
                </InfiniteScroll>
              </div>
            </Form.Item>
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

export default TeamProfile;
