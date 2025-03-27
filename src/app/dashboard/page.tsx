"use client";

import { useState, useEffect } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  LineChartOutlined,
  VideoCameraOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, DatePicker, Col, Row, Space } from 'antd';
import dayjs from "dayjs";
import NotificationCard from "./NotificationCard";

const { RangePicker } = DatePicker;
const { Header, Sider, Content } = Layout;
const getDefaultDates = () => [dayjs().subtract(6, "day"), dayjs()];

// const actions: React.ReactNode[] = [
//   <EditOutlined key="edit" />,
//   <SettingOutlined key="setting" />,
//   <EllipsisOutlined key="ellipsis" />,
// ];


export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  // const [loading, setLoading] = useState<boolean>(true);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [filters,] = useState({
    team: "",
    smartGoals: false,
    goalsMet: false,
    missedCheckins: false,
  });

  const [dashboardData, setData] = useState([]);
  const [dates, setDates] = useState(getDefaultDates());

  // const teams = [
  //   { name: "Augeo", id: "C08FD2CP3T9" },
  //   { name: "RepSpark", id: "C08FEE2J8TF" },
  //   { name: "Nigel", id: "C08F79MUE04" },
  // ];


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
  }, [filters, dates]);


  // const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  //   const { name, type, value, checked } = e.target;
  //   setFilters((prev) => ({
  //     ...prev,
  //     [name]: type === "checkbox" ? checked : value,
  //   }));
  // };


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
            { key: '2', icon: <VideoCameraOutlined />, label: 'nav 2' },
            { key: '3', icon: <UploadOutlined />, label: 'nav 3' },
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
                <Col span={12} key={index} style={{ padding: 8 }}>
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
