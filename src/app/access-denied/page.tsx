"use client";

import React, { Suspense } from "react";
import { Result, Button } from "antd";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function AccessDeniedContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  let subTitle = "Sorry, you don't have access to this application.";
  
  switch (error) {
    case "AccessDenied":
      subTitle = "You don't have access to this application. Please contact your administrator.";
      break;
    case "AccountInactive":
      subTitle = "Your account is inactive. Please contact your administrator to activate your account.";
      break;
    default:
      subTitle = "You don't have access to this application. Please contact your administrator.";
  }

  return (
    <div
      style={{
        backgroundColor: "#fff",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Result
        status="403"
        title={"Access Denied"}
        subTitle={subTitle}
        extra={
          <Link href="/login">
            <Button type="primary">Back to Login</Button>
          </Link>
        }
      />
    </div>
  );
}

export default function AccessDenied() {
  return (
    <Suspense fallback={
      <div style={{
        backgroundColor: "#fff",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}>
        <Result
          status="403"
          title={"Access Denied"}
          subTitle={"Loading..."}
          extra={
            <Link href="/login">
              <Button type="primary">Back to Login</Button>
            </Link>
          }
        />
      </div>
    }>
      <AccessDeniedContent />
    </Suspense>
  );
} 