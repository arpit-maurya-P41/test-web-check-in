import React from "react";
import { Result } from "antd";
const NotFound = () => (
  <div
    className=""
    style={{
      backgroundColor: "#fff",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
    />
  </div>
);
export default NotFound;
