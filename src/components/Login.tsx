"use client";

import React, { useState } from "react";
import { Card, Button, Typography, Space, message } from "antd";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            const result = await signIn("google", { 
                callbackUrl: "/",
                redirect: false 
            });
            
            if (result?.error) {
                message.error("Authentication failed. Please try again.");
                console.error("Auth error:", result.error);
            } else if (result?.url) {
                router.push(result.url);
            }
        } catch (error) {
            console.error("Sign in error:", error);
            message.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
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

                        <Button
                            onClick={handleGoogleSignIn}
                            loading={loading}
                            block
                            style={{ 
                                borderRadius: 8,
                                height: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "8px"
                            }}>
                            {!loading && (
                                <img 
                                    src="/images/icons/google.svg" 
                                    alt="Google" 
                                    style={{ width: "18px", height: "18px" }} 
                                    onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                    }}
                                />
                            )}
                            Sign in with Google
                        </Button>

                        <Text
                            type="secondary"
                            style={{
                                fontSize: 12,
                                textAlign: "center",
                                display: "block",
                            }}>
                            Contact your admin for access issues.
                        </Text>
                    </Space>
                </Card>
            </div>
        </>
    );
};

export default Login;
