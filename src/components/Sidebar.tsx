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

const { Sider } = Layout;

const Sidebar: React.FC<SidebarProps> = ({ userId, collapsed, canManageTeams, canManageUsers, canManageRoles, activeKey }) => {
    const sidebarItems = [];
    const dashboardItem: DashboardItem = {
        key: "dashboard",
        icon: <LineChartOutlined />,
        label: "Dashboard",
    };
    if (activeKey !== "dashboard") {
        dashboardItem.onClick = () => (window.location.href = "/dashboard");
    }
    sidebarItems.push(dashboardItem);

    const checkIns: DashboardItem = {
        key: "checkins",
        icon: <CheckCircleOutlined />,
        label: "CheckIns",
    };
    if (activeKey !== "checkins") {
        checkIns.onClick = () => (window.location.href = "/checkins");
    }
    sidebarItems.push(checkIns);

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

    if (canManageRoles) {
        const roleManagementItem: DashboardItem = {
            key: "roleManagement",
            icon: <UserSwitchOutlined />,
            label: "Roles",
        };
        if (activeKey !== "roleManagement") {
            roleManagementItem.onClick = () => (window.location.href = "/role-management");
        }
        sidebarItems.push(roleManagementItem);
    }
    
    const profileItem: DashboardItem = {
        key: "profile",
        icon: <EditOutlined />,
        label: "Profile",
    };
    if (activeKey !== "profile") {
        profileItem.onClick = () => (window.location.href = `/profile/${userId}`);
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
                defaultSelectedKeys={[activeKey]}
                items={sidebarItems}
            />
        </Sider>
    );
};

export default Sidebar;
