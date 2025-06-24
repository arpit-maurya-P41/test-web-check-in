"use client";

import React from "react";
import {
    CheckCircleOutlined,
    EditOutlined,
    LineChartOutlined,
    TeamOutlined,
    UserSwitchOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";
import { SidebarProps } from "@/type/PropTypes";
import { DashboardItem } from "@/type/types";
import { useRouter } from "next/navigation";

const { Sider } = Layout;

const Sidebar: React.FC<SidebarProps> = ({ userId, collapsed, activeKey, isAdmin = false}) => {
    const router = useRouter();
    const sidebarItems = [];
    
    const dashboardItem: DashboardItem = {
        key: "dashboard",
        icon: <LineChartOutlined />,
        label: "Dashboard",
    };
    if (activeKey !== "dashboard") {
        dashboardItem.onClick = () => router.push("/dashboard");
    }
    sidebarItems.push(dashboardItem);

    const checkIns: DashboardItem = {
        key: "checkins",
        icon: <CheckCircleOutlined />,
        label: "CheckIns",
    };
    if (activeKey !== "checkins") {
        checkIns.onClick = () => router.push("/checkins");
    }
    sidebarItems.push(checkIns);

    if (isAdmin) {
        const teamManagementItem: DashboardItem = {
            key: "teamManagement",
            icon: <TeamOutlined />,
            label: "Teams",
        };
        if (activeKey !== "teamManagement") {
            teamManagementItem.onClick = () => router.push("/team-management");
        }
        sidebarItems.push(teamManagementItem);
    }

    if (isAdmin) {
        const userManagementItem: DashboardItem = {
            key: "userManagement",
            icon: <UserSwitchOutlined />,
            label: "Users",
        };
        if (activeKey !== "userManagement") {
            userManagementItem.onClick = () => router.push("/user-management");
        }
        sidebarItems.push(userManagementItem);
    }
    
    const profileItem: DashboardItem = {
        key: "profile",
        icon: <EditOutlined />,
        label: "Profile",
    };
    if (activeKey !== "profile") {
        profileItem.onClick = () => router.push(`/profile/${userId}`);
    }
    sidebarItems.push(profileItem);

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            style={{
                minHeight: "100vh"
            }}>
            <Menu
                theme="dark"
                mode="inline"
                style={{ flex: 1 }}
                defaultSelectedKeys={[activeKey || ""]}
                items={sidebarItems}
            />
        </Sider>
    );
};

export default Sidebar;
