"use client";

import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, Space, message } from "antd";
import { loginUser } from "@/app/actions/authActions";
import { LoginFormValues } from "@/type/types";

const { Title, Text } = Typography;

const Login = () => {
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: LoginFormValues) => {
        setLoading(true);
        try {
            await loginUser(values.username, values.password);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            messageApi.open({
                type: "error",
                content: "Invalid credentials. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = () => {
        message.error("Please fix the errors in the form");
    };

    return (
        <>
            {contextHolder}
            <div
                style={{
                    height: "100vh",
                    backgroundColor: "#f4f4f4",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 16,
                }}>
                <Card
                    style={{
                        width: 380,
                        borderRadius: 16,
                        boxShadow: "0 6px 24px rgba(0,0,0,0.06)",
                        border: "1px solid #e0e0e0",
                    }}>
                    <Space
                        direction="vertical"
                        style={{ width: "100%" }}
                        size="large">
                        <div style={{ textAlign: "center" }}>
                            <img
                                src="https://particle41.com/images/temp/logo.svg"
                                alt="Logo"
                                style={{ marginBottom: 8 }}
                            />
                            <Title
                                level={3}
                                style={{ margin: 0 }}>
                                Welcome
                            </Title>
                            <Text
                                type="secondary"
                                style={{ fontSize: 14 }}>
                                Sign in to your account
                            </Text>
                        </div>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                            requiredMark={false}
                            size="middle">
                            <Form.Item
                                label="Email or Username"
                                name="username"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please enter your email or username",
                                    },
                                    {
                                        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Please enter a valid email",
                                        validateTrigger: "onBlur",
                                    },
                                ]}>
                                <Input placeholder="username@particle41.com" />
                            </Form.Item>

                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter your password",
                                    },
                                    {
                                        min: 6,
                                        message:
                                            "Password must be at least 6 characters",
                                    },
                                ]}>
                                <Input.Password placeholder="••••••••" />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    style={{ borderRadius: 8 }}
                                    loading={loading}>
                                    Sign In
                                </Button>
                            </Form.Item>
                        </Form>

                        <Text
                            type="secondary"
                            style={{
                                fontSize: 12,
                                textAlign: "center",
                                display: "block",
                            }}>
                            Forgot password? Contact your admin.
                        </Text>
                    </Space>
                </Card>
            </div>
        </>
    );
};

export default Login;
