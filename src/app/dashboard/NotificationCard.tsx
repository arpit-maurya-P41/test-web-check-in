
import React from "react";
import { Card, Typography, Space, Divider, Tag, Avatar } from "antd";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    UserOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const StatusTag: React.FC<{ missed: boolean }> = ({ missed }) => {
    return missed ? (
        <Tag
            icon={<CloseCircleOutlined />}
            color="error"
            style={{ fontSize: 12, padding: "2px 8px", borderRadius: 12, fontWeight: 500 }}
        >
            Missed
        </Tag>
    ) : (
        <Tag
            icon={<CheckCircleOutlined />}
            color="success"
            style={{ fontSize: 12, padding: "2px 8px", borderRadius: 12, fontWeight: 500 }}
        >
            Done
        </Tag>
    );
};

const NotificationCard = ({ data, withGradient = false }) => {
    const isSuccess = !data.checkin.missed && !data.checkout.missed;

    return (
        <Card
            style={{
                width: "100%",
                borderRadius: 16,
                background: "#f9f9f9", // Softer light grey
                border: withGradient
                    ? "2px solid transparent"
                    : "1px solid #e0e0e0",
                backgroundImage: withGradient
                    ? "linear-gradient(#f9f9f9, #f9f9f9), linear-gradient(90deg, #f6d365, #fda085)"
                    : "none",
                backgroundOrigin: "border-box",
                backgroundClip: withGradient ? "padding-box, border-box" : "border-box",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.05)",
                padding: 16,
                position: "relative",
            }}
        >
            {/* User Info & Date */}
            <Space align="center" style={{ justifyContent: "space-between", width: "100%", marginBottom: 12 }}>
                <Space align="center">
                    <Avatar size="small" icon={<UserOutlined />} />
                    <Text style={{ color: "#262626", fontSize: 14, fontWeight: 500 }}>
                        {data.checkin.slack_user_id}
                    </Text>
                </Space>
                <Text
                    style={{
                        color: "#595959",
                        fontSize: 12,
                        letterSpacing: 0.3,
                    }}
                >
                    {new Date(data.date).toLocaleDateString()}
                </Text>
            </Space>

            {/* Check-in Section */}
            <div>
                <Divider style={{ color: "#262626", fontWeight: 600, letterSpacing: 0.5 }}>Check-in</Divider>
                {data.checkin.missed ? (
                    <Space>
                        <StatusTag missed={true} />
                        <Text type="secondary" style={{ fontWeight: 500 }}>You missed the check-in</Text>
                    </Space>
                ) : (
                    <Space direction="vertical" size={4}>
                        <Text style={{ color: "#262626", fontWeight: 500 }}>
                            <strong>Goals:</strong> {data.checkin.goals}
                        </Text>
                        {
                            data.checkin.blockers ?
                                <Text style={{ color: "#262626", fontWeight: 500 }}>
                                    <strong>Blockers:</strong> {data.checkin.blockers}
                                </Text>
                                : null
                        }
                        {
                            data.checkin.feeling ?
                                <Text style={{ color: "#262626", fontWeight: 500 }}>
                                    <strong>Mood:</strong> {data.checkin.feeling}
                                </Text>
                                : null
                        }
                        <StatusTag missed={false} />
                    </Space>
                )}
            </div>

            {/* Checkout Section */}
            <div>
                <Divider style={{ color: "#262626", fontWeight: 600, letterSpacing: 0.5 }}>Check-out</Divider>
                {data.checkout.missed ? (
                    <Space>
                        <StatusTag missed={true} />
                        <Text type="secondary" style={{ fontWeight: 500 }}>You missed the check-out</Text>
                    </Space>
                ) : (
                    <Space direction="vertical" size={4}>
                        <Text style={{ color: "#262626", fontWeight: 500 }}>
                            <strong>Updates:</strong> {
                                data.checkout.updates
                            }
                        </Text>
                        {
                            data.checkout.blockers ?
                                <Text style={{ color: "#262626", fontWeight: 500 }}>
                                    <strong>Blockers:</strong> {data.checkout.blockers}
                                </Text>
                                : null
                        }
                        {
                            data.checkout.feeling ?
                                <Text style={{ color: "#262626", fontWeight: 500 }}>
                                    <strong>Mood:</strong> {data.checkout.feeling}
                                </Text>
                                : null
                        }
                        <StatusTag missed={false} />
                    </Space>
                )}
            </div>

            {/* SMART Goal Section */}
            <div>
                <Divider style={{ color: "#262626", fontWeight: 600, letterSpacing: 0.5 }}>SMART Goals</Divider>
                {data.checkin.is_smart_goal ? (
                    <Tag
                        icon={<CheckCircleOutlined />}
                        color="success"
                        style={{ fontSize: 12, padding: "2px 8px", borderRadius: 12, fontWeight: 500 }}
                    >
                        SMART Goals Set
                    </Tag>
                ) : (
                    <Tag
                        icon={<CloseCircleOutlined />}
                        color="error"
                        style={{ fontSize: 12, padding: "2px 8px", borderRadius: 12, fontWeight: 500 }}
                    >
                        Not SMART Goals
                    </Tag>
                )}
            </div>

            {/* Goal Met Section */}
            <div>
                <Divider style={{ color: "#262626", fontWeight: 600, letterSpacing: 0.5 }}>Goals Met</Divider>
                {isSuccess ? (
                    <Tag
                        icon={<CheckCircleOutlined />}
                        color="success"
                        style={{ fontSize: 12, padding: "2px 8px", borderRadius: 12, fontWeight: 500 }}
                    >
                        Goals Achieved
                    </Tag>
                ) : (
                    <Tag
                        icon={<CloseCircleOutlined />}
                        color="error"
                        style={{ fontSize: 12, padding: "2px 8px", borderRadius: 12, fontWeight: 500 }}
                    >
                        Goals Not Met
                    </Tag>
                )}
            </div>
        </Card>
    );
};

export default NotificationCard;
