"use client";

import { useState, useEffect } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  LineChartOutlined,
  VideoCameraOutlined,
  LogoutOutlined} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';

import NotificationCard from "./NotificationCard";



const { Header, Sider, Content } = Layout;

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

  const [filters, ] = useState({
    team: "",
    smartGoals: false,
    goalsMet: false,
    missedCheckins: false,
  });

  const [dashboardData, setData] = useState([]);

  // const teams = [
  //   { name: "Augeo", id: "C08FD2CP3T9" },
  //   { name: "RepSpark", id: "C08FEE2J8TF" },
  //   { name: "Nigel", id: "C08F79MUE04" },
  // ];


  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams();
      params.append("startDate", "2025-01-01");
      params.append("endDate", "2025-03-30");

      const res = await fetch(`/api/dashboard?${params.toString()}`);
      const data = await res.json();
      setData(JSON.parse(JSON.stringify(data.data)));
    };

    fetchData();
  }, [filters]);


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
          {
            dashboardData.map((data, index) => (
              <NotificationCard key={index} data={data} />
            ))
          }
        </Content>
      </Layout>
    </Layout>
  );
}
