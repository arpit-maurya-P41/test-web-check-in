"use client";

import { useState, useEffect } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LineChartOutlined,
  LogoutOutlined,
  TeamOutlined,
  UserSwitchOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, DatePicker, Col, Row, Space } from 'antd';
import dayjs from "dayjs";
import NotificationCard from "./NotificationCard";

const { RangePicker } = DatePicker;
const { Header, Sider, Content } = Layout;
const getDefaultDates = () => [dayjs().subtract(6, "day"), dayjs()];

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);

  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  const [dashboardData, setData] = useState([]);
  const [dates, setDates] = useState(getDefaultDates());

  const handleRangeChange = (values) => {
    if (values === null) {
      // If cleared, reset to default
      const defaultDates = getDefaultDates();
      setDates(defaultDates);
    } else {
      setDates(values);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams();
      const formatted = dates.map((d) => d.format("YYYY-MM-DD"));
      const [startDate, endDate] = formatted;

      params.append("startDate", startDate);
      params.append("endDate", endDate);

      const res = await fetch(`/api/dashboard?${params.toString()}`);
      const data = await res.json();
      setData(JSON.parse(JSON.stringify(data.data)));
    };

    fetchData();
  }, [dates]);

  return (
    <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <Menu
          theme="dark"
          mode="inline"
          style={{ flex: 1 }}
          defaultSelectedKeys={['dashboard']}
          items={[
            { key: 'dashboard', icon: <LineChartOutlined />, label: 'Dashboard' },
            // { key: 'teamManagement', icon: <TeamOutlined />, label: 'Teams', onClick: () => window.location.href = '/team-management' },
            // { key: "userManagement", icon: <UserSwitchOutlined />, label: "Users", onClick: () => window.location.href = "/user-managment" }
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />

          <Button
            type="text"
            icon={<LogoutOutlined />}
            // TODO: Add onclick handler onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
              position: 'absolute',
              right: 0,
            }}
          />
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}

        >
          <Row>
            <Col span={6} style={{ margin: "auto" }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                Select Date Range
                <RangePicker
                  onChange={handleRangeChange}
                  value={dates}
                  format="YYYY-MM-DD"
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "8px",
                  }}
                  allowClear
                />
              </Space>

            </Col>
          </Row>
          <Row>
            {
              dashboardData.map((data, index) => (
                <Col span={24} key={index} style={{ padding: 8 }}>
                  <NotificationCard data={data} />
                </Col>
              ))
            }
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
}
