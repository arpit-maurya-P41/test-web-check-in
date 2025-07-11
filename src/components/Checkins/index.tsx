"use client";
import {
  Button,
  Card,
  Dropdown,
  Layout,
  MenuProps,
  theme,
  Row,
  Col,
  Progress,
  Modal,
  DatePicker,
  message,
} from "antd";
import Papa from 'papaparse';
import Sidebar from "../Sidebar";
import { useEffect, useState, useMemo } from "react";
import {
  DownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LeftOutlined,
  RightOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { logoutUser } from "@/app/actions/authActions";
import { useSidebarStore } from "@/store/sidebarStore";
import "./Checkins.css";
import { CheckinAPIResponse } from "@/type/types";
import { CheckinProps, Team } from "@/type/PropTypes";
import dayjs, { Dayjs } from "dayjs";
import { useFetch } from "@/utils/useFetch";
const { Header, Content } = Layout;
const { RangePicker } = DatePicker;

const Checkins: React.FC<CheckinProps> = ({
  userId,
  teams,
  isAdmin,
  isManager,
}) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { sidebarCollapsed, toggleSidebar } = useSidebarStore();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [checkInsData, setCheckInsData] = useState<CheckinAPIResponse | null>(null);
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportClick = () => {
    setIsExportModalOpen(true);
  };

  const handleExportCancel = () => {
    setIsExportModalOpen(false);
    setExportDateRange(null);
  };

  const convertToCSV = (data: any[]) => {
    // Transform the data into a flat structure suitable for CSV
    const csvData = data.map(entry => {
      // Define the type for our row object
      type RowType = {
        Date: string;
        "Team Name": string;
        "Team ID": number;
        "User Name": string;
        "User ID": number;
        "Has Checked In": string;
        "Is Blocked": string;
        "Smart Goals Percentage": number;
        [key: string]: string | number; // Allow dynamic keys for goals
      };

      const baseRow: RowType = {
        Date: entry.date,
        "Team Name": entry.teamName,
        "Team ID": entry.teamId,
        "User Name": entry.userName,
        "User ID": entry.userId,
        "Has Checked In": entry.hasCheckedIn ? "Yes" : "No",
        "Is Blocked": entry.isBlocked ? "Yes" : "No",
        "Smart Goals Percentage": entry.smartGoalsPercentage || 0,
      };

      // Add goals columns
      entry.goals.forEach((goal: { goalText: string; isSmart: boolean }, index: number) => {
        baseRow[`Goal ${index + 1}`] = goal.goalText;
        baseRow[`Goal ${index + 1} Smart`] = goal.isSmart ? "Yes" : "No";
      });

      // Fill in empty goals if less than 2 goals
      for (let i = entry.goals.length + 1; i <= 2; i++) {
        baseRow[`Goal ${i}`] = "";
        baseRow[`Goal ${i} Smart`] = "No";
      }

      return baseRow;
    });

    return Papa.unparse(csvData, {
      quotes: true, // Use quotes around all fields
      header: true, // Include header row
      delimiter: ",",
    });
  };

  const downloadCSV = (csvString: string, filename: string) => {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleExportSubmit = async () => {
    if (!exportDateRange || !exportDateRange[0] || !exportDateRange[1]) {
      message.error('Please select a date range');
      return;
    }

    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        startDate: exportDateRange[0].format('YYYY-MM-DD'),
        endDate: exportDateRange[1].format('YYYY-MM-DD'),
      });

      if (selectedTeam) {
        params.append('teamId', selectedTeam.id.toString());
      }

      const response = await fetch(`/api/checkins/export?${params.toString()}`);
      const data = await response.json();
      
      if (data.exportData) {
        const csvString = convertToCSV(data.exportData);
        const filename = `checkins_${exportDateRange[0].format('YYYY-MM-DD')}_to_${exportDateRange[1].format('YYYY-MM-DD')}.csv`;
        downloadCSV(csvString, filename);
        message.success('Data exported successfully');
      } else {
        message.error('No data available for export');
      }
      
      setIsExportModalOpen(false);
      setExportDateRange(null);
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreviousDay = () => {
    setCurrentDate((prev) => prev.subtract(1, "day"));
  };

  const handleNextDay = () => {
    const nextDay = currentDate.add(1, "day");
    if (nextDay.isBefore(dayjs(), "day") || nextDay.isSame(dayjs(), "day")) {
      setCurrentDate(nextDay);
    }
  };

  const handleToday = () => {
    setCurrentDate(dayjs());
  };

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    const team = teams.find((t) => t.id.toString() === e.key);
    if (team) {
      setSelectedTeam(team);
    }
  };

  const teamMenuItems: MenuProps["items"] = teams.map((team) => ({
    key: team.id,
    label: team.name,
  }));

  const handleAllTeamsClick = () => {
    setSelectedTeam(null);
  };

  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    const dateStr = currentDate.format("YYYY-MM-DD");
    if (selectedTeam) {
      params.append("teamId", selectedTeam.id.toString());
    }
    
    params.append("date", dateStr);
    
    // Add user ID and role information
    params.append("userId", userId);
    params.append("isAdmin", isAdmin.toString());    
    const result = params.toString();
    console.log('Query params changed:', result);
    return result;
  }, [selectedTeam, currentDate, userId, isAdmin]);

  const { data: checkinsData } = useFetch<CheckinAPIResponse>(
    queryParams ? `/api/checkins?${queryParams}` : '',
    {
      dependencies: [queryParams],
      skipOnMount: !queryParams,
    }
  );

  useEffect(() => {
    if (checkinsData) {
      setCheckInsData({
        date: checkinsData.date,
        teamSummary: checkinsData.teamSummary,
        checkedInUsers: checkinsData.checkedInUsers || [],
        notCheckedInUsers: checkinsData.notCheckedInUsers || []
      });
    }
  }, [checkinsData]);

  const isToday = currentDate.isSame(dayjs(), "day");
  const isFutureDate = currentDate.isAfter(dayjs(), "day");

  return (
    <Layout>
      <Sidebar
        activeKey="checkins"
        userId={userId}
        isAdmin={isAdmin}
        isManager={isManager}
      />
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              padding: "0 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <Button
                type="text"
                icon={
                  sidebarCollapsed ? (
                    <MenuUnfoldOutlined />
                  ) : (
                    <MenuFoldOutlined />
                  )
                }
                onClick={toggleSidebar}
                style={{ fontSize: 16, width: 48, height: 48 }}
              />
              <span
                style={{
                  fontWeight: selectedTeam ? "normal" : 500,
                  fontSize: "16px",
                  backgroundColor: selectedTeam ? "transparent" : "#f0f0f0",
                  height: "2rem",
                  padding: "0 8px",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
                onClick={handleAllTeamsClick}
              >
                All Teams
              </span>

              <Dropdown
                menu={{ items: teamMenuItems, onClick: handleMenuClick }}
                trigger={["click"]}
              >
                <Button type="text" style={{ 
                  fontWeight: selectedTeam ? 500 : "normal",
                  fontSize: 16, backgroundColor: selectedTeam ? "#f0f0f0" : "transparent" }}>
                  {selectedTeam?.name || "Select Team"} <DownOutlined />
                </Button>
              </Dropdown>

              {/* Date Navigation */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  border: "1px solid #d9d9d9",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  height: "2rem",
                }}
              >
                <Button
                  type="text"
                  icon={<LeftOutlined />}
                  onClick={handlePreviousDay}
                  style={{ padding: "4px 8px" }}
                />

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "14px", fontWeight: 500 }}>
                    {currentDate.format("MMM DD, YYYY")}
                  </div>
                </div>

                <Button
                  type="text"
                  icon={<RightOutlined />}
                  onClick={handleNextDay}
                  disabled={isFutureDate}
                  style={{ padding: "4px 8px" }}
                />
              </div>

              <Button
                type="primary"
                size="small"
                onClick={handleToday}
                disabled={isToday}
                style={{ fontSize: "12px", height: "1.8rem" }}
              >
                Today
              </Button>

              {/* Export Button */}
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportClick}
                style={{ height: "1.8rem" }}
              >
                Export
              </Button>
            </div>

            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={() => logoutUser()}
              style={{ fontSize: 16, width: 48, height: 48 }}
            />
          </div>
        </Header>

        {/* Export Modal */}
        <Modal
          title="Export Check-ins"
          open={isExportModalOpen}
          onCancel={handleExportCancel}
          footer={[
            <Button key="cancel" onClick={handleExportCancel}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={isExporting}
              onClick={handleExportSubmit}
              disabled={!exportDateRange}
            >
              Export
            </Button>,
          ]}
        >
          <div style={{ padding: "20px 0" }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>Select Date Range:</div>
              <RangePicker
                style={{ width: "100%" }}
                value={exportDateRange}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setExportDateRange([dates[0], dates[1]]);
                  } else {
                    setExportDateRange(null);
                  }
                }}
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </div>
            {selectedTeam && (
              <div style={{ color: '#666' }}>
                Exporting data for team: {selectedTeam.name}
              </div>
            )}
          </div>
        </Modal>

        <Content
          style={{
            margin: "24px 16px",
            padding: 16,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {checkInsData ? (
            <>
              {/* Day Summary Section */}
              <Card
                style={{
                  marginBottom: 24,
                  backgroundColor: "#fafafa",
                  border: "1px solid #f0f0f0",
                }}
              >
                <Row gutter={[24, 24]}>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: "center" }}>
                      <Progress
                        type="circle"
                        percent={Math.round(checkInsData.teamSummary.participation.percentage || 0)}
                        format={(percent) => `${Math.round(percent || 0)}%`}
                      />
                      <div style={{ marginTop: "12px", fontWeight: "500" }}>
                        Participation ({checkInsData.teamSummary.participation.count} of {checkInsData.teamSummary.totalMembers})
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: "center" }}>
                      <Progress
                        type="circle"
                        percent={Math.round(checkInsData.teamSummary.blockers.percentage || 0)}
                        format={(percent) => `${Math.round(percent || 0)}%`}
                        status="exception"
                      />
                      <div style={{ marginTop: "12px", fontWeight: "500" }}>
                        Blockers ({checkInsData.teamSummary.blockers.count})
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: "center" }}>
                      <Progress
                        type="circle"
                        percent={Math.round(checkInsData.teamSummary.smart.percentage || 0)}
                        format={(percent) => `${Math.round(percent || 0)}%`}
                        status="active"
                      />
                      <div style={{ marginTop: "12px", fontWeight: "500" }}>
                        SMART Goals ({checkInsData.teamSummary.smart.smartGoals} of {checkInsData.teamSummary.smart.totalGoals})
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Checked In Users Section */}
              <Card
                style={{
                  border: "1px solid #eee",
                  padding: "16px",
                  borderRadius: 8,
                  backgroundColor: "#fff",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                }}
              >
                <h2 style={{ marginBottom: 16 }}>
                  Check-ins for {currentDate.format("MMM DD, YYYY")}
                </h2>
                
                {/* Not Checked In Users Section */}
                {checkInsData.notCheckedInUsers.length > 0 && (
                  <div style={{ marginBottom: 32 }}>
                    <h3 style={{ marginBottom: 16, color: "#ff4d4f" }}>
                      ❌ Not Checked In ({checkInsData.notCheckedInUsers.length})
                    </h3>
                    <div style={{ 
                      display: "flex", 
                      flexWrap: "wrap", 
                      gap: "8px",
                      marginBottom: 16
                    }}>
                      {checkInsData.notCheckedInUsers.map((user) => (
                        <div
                          key={user.user_id}
                          style={{
                            backgroundColor: "#fff2f0",
                            border: "1px solid #ffccc7",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            fontSize: "14px",
                            color: "#a8071a",
                          }}
                        >
                          {user.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {checkInsData.checkedInUsers.length > 0 && (
                  <div style={{ marginBottom: 32 }}>
                    <h3 style={{ marginBottom: 16, color: "#52c41a" }}>
                      ✅ Checked In ({checkInsData.checkedInUsers.length})
                    </h3>
                    
                    {selectedTeam === null ? (
                      // All Teams selected: group by team and show team header
                      (() => {
                        const usersByTeam: Record<number, typeof checkInsData.checkedInUsers> = checkInsData.checkedInUsers.reduce((acc: Record<number, typeof checkInsData.checkedInUsers>, user) => {
                          const teamId = user.team_id;
                          if (!acc[teamId]) {
                            acc[teamId] = [];
                          }
                          acc[teamId].push(user);
                          return acc;
                        }, {});
                        return Object.entries(usersByTeam).map(([teamId, users]) => {
                          const teamIdNum = parseInt(teamId);
                          const team = teams.find(t => t.id === teamIdNum);
                          const teamName = team ? team.name : `Team ${teamIdNum}`;
                          return (
                            <div key={teamId} style={{ marginBottom: 24 }}>
                              <div style={{
                                backgroundColor: "#e6f7ff",
                                padding: "10px 16px",
                                borderRadius: "8px",
                                marginBottom: "16px",
                                borderLeft: "4px solid #1890ff",
                                fontWeight: "600",
                                fontSize: "16px"
                              }}>
                                {teamName}
                              </div>
                              {users.map((user, index) => (
                                <div key={`${user.user_id}-${user.team_id}-${index}`} style={{ marginBottom: 16, marginLeft: 16 }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      marginBottom: 12,
                                      backgroundColor: "#f8f9fa",
                                      padding: "10px",
                                      borderRadius: "8px",
                                    }}
                                  >
                                    <span style={{ marginRight: 8, fontSize: 16 }}>
                                      👤
                                    </span>
                                    <strong style={{ fontSize: 15 }}>{user.user.name}</strong>
                                    {user.is_blocked && (
                                      <span style={{ 
                                        marginLeft: 8, 
                                        color: "#ff4d4f",
                                        fontSize: 14,
                                        fontWeight: 500
                                      }}>
                                        🚫 Blocked
                                      </span>
                                    )}
                                  </div>
                                  {user.user.goals.length > 0 ? (
                                    <ul
                                      style={{
                                        paddingLeft: 20,
                                        margin: 0,
                                        listStyle: "none",
                                      }}
                                    >
                                      {user.user.goals.map((goal, idx: number) => (
                                        <li
                                          key={idx}
                                          style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "8px",
                                            backgroundColor: "#fff",
                                            marginBottom: "8px",
                                            padding: "8px",
                                            borderRadius: "4px",
                                            border: "1px solid #f0f0f0",
                                          }}
                                        >
                                          <span style={{ marginTop: "2px" }}>
                                            •
                                          </span>
                                          <span style={{ flex: 1 }}>
                                            {goal.goal_text}
                                            {goal.is_smart && (
                                              <span style={{ 
                                                marginLeft: 8, 
                                                color: "#1890ff",
                                                fontSize: 12,
                                                fontWeight: 500
                                              }}>
                                                SMART
                                              </span>
                                            )}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p
                                      style={{
                                        margin: "0 0 0 20px",
                                        color: "#666",
                                        fontStyle: "italic",
                                      }}
                                    >
                                      No goals set for today.
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        });
                      })()
                    ) : (
                      // Specific team selected: just show users
                      checkInsData.checkedInUsers.map((user, index) => (
                        <div key={`${user.user_id}-${user.team_id}-${index}`} style={{ marginBottom: 16 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              marginBottom: 12,
                              backgroundColor: "#f8f9fa",
                              padding: "10px",
                              borderRadius: "8px",
                            }}
                          >
                            <span style={{ marginRight: 8, fontSize: 16 }}>
                              👤
                            </span>
                            <strong style={{ fontSize: 15 }}>{user.user.name}</strong>
                            {user.is_blocked && (
                              <span style={{ 
                                marginLeft: 8, 
                                color: "#ff4d4f",
                                fontSize: 14,
                                fontWeight: 500
                              }}>
                                🚫 Blocked
                              </span>
                            )}
                          </div>
                          {user.user.goals.length > 0 ? (
                            <ul
                              style={{
                                paddingLeft: 20,
                                margin: 0,
                                listStyle: "none",
                              }}
                            >
                              {user.user.goals.map((goal, idx: number) => (
                                <li
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "8px",
                                    backgroundColor: "#fff",
                                    marginBottom: "8px",
                                    padding: "8px",
                                    borderRadius: "4px",
                                    border: "1px solid #f0f0f0",
                                  }}
                                >
                                  <span style={{ marginTop: "2px" }}>
                                    •
                                  </span>
                                  <span style={{ flex: 1 }}>
                                    {goal.goal_text}
                                    {goal.is_smart && (
                                      <span style={{ 
                                        marginLeft: 8, 
                                        color: "#1890ff",
                                        fontSize: 12,
                                        fontWeight: 500
                                      }}>
                                        SMART
                                      </span>
                                    )}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p
                              style={{
                                margin: "0 0 0 20px",
                                color: "#666",
                                fontStyle: "italic",
                              }}
                            >
                              No goals set for today.
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>
            </>
          ) : (
            <Card
              style={{
                border: "1px solid #eee",
                padding: "16px",
                borderRadius: 8,
                backgroundColor: "#fff",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                textAlign: "center",
              }}
            >
              <div
                style={{ fontSize: "16px", color: "#666", marginBottom: "8px" }}
              >
                No check-ins found for {currentDate.format("MMM DD, YYYY")}
              </div>
              <div style={{ fontSize: "14px", color: "#999" }}>
                {isToday
                  ? "No one has checked in today yet."
                  : "No check-ins were recorded on this date."}
              </div>
            </Card>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Checkins;
