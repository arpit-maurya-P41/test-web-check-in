import React from "react";
import {
    LineChartOutlined,
    TeamOutlined,
    UserSwitchOutlined,
} from "@ant-design/icons";
import { Layout, Menu } from "antd";

const { Sider } = Layout;

type Props = {
    collapsed: boolean;
    canManageTeams: boolean;
    canManageUsers: boolean;
    canViewReports: boolean;
    activeKey: string;
};

type DashboardItem = {
    key: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
};

const Sidebar: React.FC<Props> = ({ collapsed, canManageTeams, canManageUsers, activeKey }) => {
    const sidebarItems = [];
    const dashboardItem: DashboardItem = {
        key: "dashboard",
        icon: <LineChartOutlined />,
        label: "Dashboard",
    };
    if (activeKey !== "dashboard") {
        dashboardItem.onClick = undefined; // Placeholder to avoid errors
    }
    sidebarItems.push(dashboardItem);

    if (canManageTeams) {
        const teamManagementItem: DashboardItem = {
            key: "teamManagement",
            icon: <TeamOutlined />,
            label: "Teams",
        };
        if (activeKey !== "teamManagement") {
            teamManagementItem.onClick = () => (window.location.href = "/team-management");
        }
        sidebarItems.push(teamManagementItem);
    }

    if (canManageUsers) {
        const userManagementItem: DashboardItem = {
            key: "userManagement",
            icon: <UserSwitchOutlined />,
            label: "Users",
        };
        if (activeKey !== "userManagement") {
            userManagementItem.onClick = () => (window.location.href = "/user-management");
        }
        sidebarItems.push(userManagementItem);
    }

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            style={{ height: "100vh" }}>
            <Menu
                theme="dark"
                mode="inline"
                style={{ flex: 1 }}
                defaultSelectedKeys={[activeKey]}
                items={sidebarItems}
            />
        </Sider>
    );
};

export default Sidebar;
