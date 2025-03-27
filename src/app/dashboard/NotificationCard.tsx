
import React from "react";
import { Card, Typography, Space, Divider } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;


interface CheckinData {
    goals: string;
    blockers: string;
    feeling: string;
    is_smart_goal: boolean;
    missed?: boolean;
}

interface CheckoutData {
    updates: string;
    blockers: string;
    feeling: string;
    goals_met: boolean;
    missed?: boolean;
}

interface NotificationData {
    date: string;
    checkin: CheckinData;
    checkout: CheckoutData;
}

const SuccessCard = ({ data }: { data: NotificationData }) => {
    return (
        <Card
            style={{
                width: "100%",
                borderRadius: 16,
                boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                background: "#f0fff4",
                border: "1px solid #b7eb8f",
                padding: 16,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                position: "relative",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0px 8px 24px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0px 4px 12px rgba(0,0,0,0.08)";
            }}
        >
            <Text
                style={{
                    position: "absolute",
                    top: 12,
                    right: 16,
                    color: "#52c41a",
                    fontSize: 12,
                }}
            >
                {new Date(data.date).toDateString()}
            </Text>
            <Space direction="vertical" style={{ width: "100%", alignItems: "center" }}>
                <CheckCircleOutlined style={{ fontSize: 48, color: "#52c41a" }} />
                <Title level={3} style={{ color: "#389e0d", margin: 0 }}>
                    Check-in & Checkout Completed
                </Title>
                <Divider />
                <Space direction="vertical" style={{ width: "100%", textAlign: "center" }}>
                    <Title level={5}>Check-in</Title>
                    <Text>Goal: {data.checkin.goals}</Text>
                    <Text>Blockers: {data.checkin.blockers}</Text>
                    <Text>Feeling: {data.checkin.feeling}</Text>
                </Space>
                <Divider />
                <Space direction="vertical" style={{ width: "100%", textAlign: "center" }}>
                    <Title level={5}>Check-out</Title>
                    <Text>Updates: {data.checkout.updates}</Text>
                    <Text>Blockers: {data.checkin.blockers}</Text>
                    <Text>Feeling: {data.checkin.feeling}</Text>
                </Space>
                <Divider />
                <Space direction="vertical" style={{ width: "100%", textAlign: "center" }}>
                    <Title level={5}>SMART Goal</Title>
                    {data.checkin.is_smart_goal ? (
                        <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    ) : (
                        <CloseCircleOutlined style={{ color: "#f5222d" }} />
                    )}
                </Space>
                <Space direction="vertical" style={{ width: "100%", textAlign: "center" }}>
                    <Title level={5}>Goals Met</Title>
                    {data.checkout.goals_met ? (
                        <CheckCircleOutlined style={{ color: "#52c41a" }} />
                    ) : (
                        <CloseCircleOutlined style={{ color: "#f5222d" }} />
                    )}
                </Space>
            </Space>
        </Card>
    );
};

const ErrorCard = ({ data }: { data: NotificationData }) => {
    return (
        <Card
            style={{
                width: "100%",
                borderRadius: 16,
                boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                background: "#fff5f5",
                border: "1px solid #f5c2c7",
                padding: 16,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                position: "relative",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0px 8px 24px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0px 4px 12px rgba(0,0,0,0.08)";
            }}
        >
            <Text
                style={{
                    position: "absolute",
                    top: 12,
                    right: 16,
                    color: "#c62828",
                    fontSize: 12,
                }}
            >
                {new Date(data.date).toDateString()}
            </Text>
            <Space direction="vertical" style={{ width: "100%", alignItems: "center" }}>
                <CloseCircleOutlined style={{ fontSize: 48, color: "#e57373" }} />
                <Title level={3} style={{ color: "#c62828", margin: 0 }}>
                    Check-in / Checkout Missed
                </Title>
                <Divider />
                <Space direction="vertical" style={{ width: "100%", textAlign: "center" }}>
                    <Title level={5}>Check-in</Title>
                    {data.checkin.missed ? (
                        <Text>Missed</Text>
                    ) : (
                        <>
                            <Text>Goal: {data.checkin.goals}</Text>
                            <Text>Blockers: {data.checkin.blockers}</Text>
                            <Text>Feeling: {data.checkin.feeling}</Text>
                        </>
                    )}
                </Space>
                <Divider />
                <Space direction="vertical" style={{ width: "100%", textAlign: "center" }}>
                    <Title level={5}>Check-out</Title>
                    {data.checkout.missed ? (
                        <Text>Missed</Text>
                    ) : (
                        <>
                            <Text>Updates: {data.checkout.updates}</Text>
                            <Text>Blockers: {data.checkin.blockers}</Text>
                            <Text>Feeling: {data.checkin.feeling}</Text>
                        </>
                    )}
                </Space>
                <Divider />
                {
                    !data.checkin.missed ?
                        <Space direction="vertical" style={{ width: "100%", textAlign: "center" }}>
                            <Title level={5}>SMART Goal</Title>
                            {data.checkin.is_smart_goal ? (
                                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                            ) : (
                                <CloseCircleOutlined style={{ color: "#f5222d" }} />
                            )}
                        </Space> : null
                }
                {
                    !data.checkout.missed ?
                        <Space direction="vertical" style={{ width: "100%", textAlign: "center" }}>
                            <Title level={5}>Goals Met</Title>
                            {data.checkout.goals_met ? (
                                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                            ) : (
                                <CloseCircleOutlined style={{ color: "#f5222d" }} />
                            )}
                        </Space> : null
                }
            </Space>
        </Card>
    );
};

const NotificationCard = ({ data }: { data: NotificationData }) => {
    const isSuccess = !data.checkin.missed && !data.checkout.missed;
    return isSuccess ? <SuccessCard data={data} /> : <ErrorCard data={data} />;
};

export default NotificationCard;
