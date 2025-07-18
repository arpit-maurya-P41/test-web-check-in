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
import { useSidebarStore } from "@/store/sidebarStore";

const { Sider } = Layout;

const Sidebar: React.FC<SidebarProps> = ({ userId, activeKey, isAdmin = false, isManager = false}) => {
    const router = useRouter();
    const { sidebarCollapsed } = useSidebarStore();
    const sidebarItems = [];
    
    const handleNavigation = (path: string) => {
        router.push(path);
    };
    
    const dashboardItem: DashboardItem = {
        key: "dashboard",
        icon: <LineChartOutlined />,
        label: "Dashboard",
    };
    if (activeKey !== "dashboard") {
        dashboardItem.onClick = () => handleNavigation("/dashboard");
    }
    sidebarItems.push(dashboardItem);

    const checkIns: DashboardItem = {
        key: "checkins",
        icon: <CheckCircleOutlined />,
        label: "CheckIns",
    };
    if (activeKey !== "checkins") {
        checkIns.onClick = () => handleNavigation("/checkins");
    }
    sidebarItems.push(checkIns);

    if (isAdmin || isManager) {
        const teamManagementItem: DashboardItem = {
            key: "teamManagement",
            icon: <TeamOutlined />,
            label: "Teams",
        };
        if (activeKey !== "teamManagement") {
            teamManagementItem.onClick = () => handleNavigation("/team-management");
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
            userManagementItem.onClick = () => handleNavigation("/user-management");
        }
        sidebarItems.push(userManagementItem);
    }
    
    const profileItem: DashboardItem = {
        key: "profile",
        icon: <EditOutlined />,
        label: "Profile",
    };
    if (activeKey !== "profile") {
        profileItem.onClick = () => handleNavigation(`/profile/${userId}`);
    }
    sidebarItems.push(profileItem);

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={sidebarCollapsed}
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
